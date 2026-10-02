import { db } from '../../infra/database/client.js';
import { NormalizedWebhookEvent } from './psp-adapter.interface.js';
import { FinancialStateMachine } from '../../domain/state-machine/financial-state-machine.js';
import { ExceptionsHandler } from '../reconciliation/exceptions-handler.js';
import { ReceiptEmailService } from '../notifications/receipt-email.service.js';

export interface ProcessEventResult {
  processed: boolean;
  status: string;
  transactionId?: string;
  notes?: string;
}

export class EventProcessorService {
  static async processNormalizedEvent(event: NormalizedWebhookEvent): Promise<ProcessEventResult> {
    // 1. Busca a cobrança correspondente no banco
    const charge = db.findPspChargeByExternalId(event.externalChargeId);

    // Cenário: Pix órfão / Pagamento sem cobrança cadastrada
    if (!charge) {
      ExceptionsHandler.handleOrphanPix(event.externalChargeId, event.amountPaid);
      return {
        processed: true,
        status: 'ORPHAN_PIX_RECORDED',
        notes: 'Pix recebido sem intenção/cobrança prévia identificada. Registrado para conciliação manual.',
      };
    }

    const intent = db.findDonationIntentById(charge.donationIntentId);
    if (!intent) {
      throw new Error(`Inconsistência de integridade: cobrança ${charge.id} sem intenção associada.`);
    }

    // 2. Tratamento de Estorno / Devolução
    if (event.eventType === 'PAYMENT_REFUNDED') {
      const originalTx = Array.from(db.paymentTransactions.values()).find(
        (t) => t.pspChargeId === charge.id && t.transactionType === 'PAYMENT'
      );

      const refundTx = db.createPaymentTransaction({
        donationIntentId: intent.id,
        pspChargeId: charge.id,
        externalTransactionId: event.externalTransactionId,
        paymentMethod: intent.paymentMethod || 'PIX',
        amountPaid: -Math.abs(event.amountPaid),
        feeDeducted: 0,
        netAmount: -Math.abs(event.amountPaid),
        transactionType: 'REFUND',
        parentTransactionId: originalTx ? originalTx.id : null,
        paidAt: event.paidAt,
      });

      return {
        processed: true,
        status: 'REFUNDED',
        transactionId: refundTx.id,
      };
    }

    // 3. Tratamento de Confirmação de Pagamento
    if (event.eventType === 'PAYMENT_CONFIRMED') {
      // 3.1 Criação ou busca de transação idempotente
      const transaction = db.createPaymentTransaction({
        donationIntentId: intent.id,
        pspChargeId: charge.id,
        externalTransactionId: event.externalTransactionId,
        paymentMethod: intent.paymentMethod || 'PIX',
        amountPaid: event.amountPaid,
        feeDeducted: event.feeDeducted,
        netAmount: event.amountPaid - event.feeDeducted,
        transactionType: 'PAYMENT',
        paidAt: event.paidAt,
      });

      // Se for Pix Recorrente, ativa a assinatura associada
      if (intent.frequency === 'MONTHLY') {
        const pendingSub = Array.from(db.recurringSubscriptions.values()).find(
          (s) => s.donorId === intent.donorId && s.status === 'PENDING'
        );
        if (pendingSub) {
          pendingSub.status = 'ACTIVE';
          pendingSub.updatedAt = new Date();
        }
      }

      // 3.2 Verificação de divergência de valor
      if (Math.abs(event.amountPaid - intent.amount) > 0.01) {
        ExceptionsHandler.handleDivergentAmount({
          intentId: intent.id,
          transaction,
          expectedAmount: intent.amount,
          actualAmount: event.amountPaid,
        });
      }

      // 3.3 Verificação de expiração e pagamento tardio
      const isLatePayment = event.paidAt.getTime() > intent.expiresAt.getTime() || intent.status === 'EXPIRED';

      let newStatus: typeof intent.status;
      if (isLatePayment) {
        newStatus = FinancialStateMachine.transition(intent.status, 'PAYMENT_RECEIVED');
        ExceptionsHandler.handleLatePayment({
          intentId: intent.id,
          transaction,
          expiresAt: intent.expiresAt,
          paidAt: event.paidAt,
        });
      } else {
        newStatus = FinancialStateMachine.transition(intent.status, 'PAYMENT_RECEIVED');
      }

      db.updateDonationIntentStatus(intent.id, newStatus);

      // 3.4 Despacho de comprovante transacional (apenas se confirmado como PAID)
      if (newStatus === 'PAID') {
        const donor = db.findDonorById(intent.donorId);
        if (donor) {
          await ReceiptEmailService.sendDonationReceipt({
            intentId: intent.id,
            donorEmail: donor.email,
            donorName: donor.fullName,
            amount: transaction.amountPaid,
            paidAt: transaction.paidAt,
            transactionId: transaction.id,
          });
        }
      }

      return {
        processed: true,
        status: newStatus,
        transactionId: transaction.id,
      };
    }

    return {
      processed: false,
      status: 'IGNORED_EVENT_TYPE',
    };
  }
}

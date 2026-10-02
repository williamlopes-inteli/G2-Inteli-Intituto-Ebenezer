import { db, PaymentTransactionRecord, ReconciliationItemRecord } from '../../infra/database/client.js';

export interface HandleLatePaymentInput {
  intentId: string;
  transaction: PaymentTransactionRecord;
  expiresAt: Date;
  paidAt: Date;
}

export interface HandleDivergentAmountInput {
  intentId: string;
  transaction: PaymentTransactionRecord;
  expectedAmount: number;
  actualAmount: number;
}

export class ExceptionsHandler {
  /**
   * Trata recebimento de pagamento após o término do prazo de validade da intenção.
   * Não descarta o valor recebido e envia para a Caixa de Exceções.
   */
  static handleLatePayment(input: HandleLatePaymentInput): ReconciliationItemRecord {
    const diffMinutes = Math.round((input.paidAt.getTime() - input.expiresAt.getTime()) / 60000);
    const reason = `Pagamento Pix recebido ${diffMinutes} minuto(s) após o horário limite de expiração da intenção.`;

    const item = db.createReconciliationItem({
      paymentTransactionId: input.transaction.id,
      externalReference: input.transaction.externalTransactionId,
      expectedAmount: input.transaction.amountPaid,
      actualAmount: input.transaction.amountPaid,
      status: 'UNDER_REVIEW',
      discrepancyReason: reason,
    });

    console.warn(`[FINANCIAL_EXCEPTION] Pagamento tardio retido para revisão: Intenção ${input.intentId}`);
    return item;
  }

  /**
   * Trata recebimento de pagamento com valor divergente da cobrança solicitada.
   */
  static handleDivergentAmount(input: HandleDivergentAmountInput): ReconciliationItemRecord {
    const diff = (input.actualAmount - input.expectedAmount).toFixed(2);
    const reason = `Valor pago (R$ ${input.actualAmount.toFixed(2)}) diverge do valor pretendido (R$ ${input.expectedAmount.toFixed(2)}). Diferença: R$ ${diff}`;

    const item = db.createReconciliationItem({
      paymentTransactionId: input.transaction.id,
      externalReference: input.transaction.externalTransactionId,
      expectedAmount: input.expectedAmount,
      actualAmount: input.actualAmount,
      status: 'DIVERGENT',
      discrepancyReason: reason,
    });

    console.warn(`[FINANCIAL_EXCEPTION] Divergência de valor identificada: Intenção ${input.intentId}`);
    return item;
  }

  /**
   * Trata Pix recebido avulso (órfão) direto no extrato ou chave do Instituto sem intenção prévia.
   */
  static handleOrphanPix(externalReference: string, amount: number): ReconciliationItemRecord {
    return db.createReconciliationItem({
      paymentTransactionId: null,
      externalReference,
      expectedAmount: 0,
      actualAmount: amount,
      status: 'UNMATCHED',
      discrepancyReason: 'Pix recebido diretamente na conta sem intenção de doação cadastrada no checkout.',
    });
  }
}

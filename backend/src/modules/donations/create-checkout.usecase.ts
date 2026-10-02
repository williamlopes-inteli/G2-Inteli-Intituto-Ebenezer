import { z } from 'zod';
import { db, PaymentMethod, DonationFrequency } from '../../infra/database/client.js';
import { PspFactory } from '../psp/psp-factory.js';
import { FinancialStateMachine } from '../../domain/state-machine/financial-state-machine.js';
import { ReceiptEmailService } from '../notifications/receipt-email.service.js';

export const creditCardSchema = z.object({
  holderName: z.string().min(3, 'Nome no cartão é obrigatório'),
  number: z.string().min(13, 'Número de cartão inválido').max(19),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Validade deve estar no formato MM/AA'),
  cvv: z.string().min(3, 'CVV inválido').max(4),
});

export const createDonationSchema = z.object({
  campaignId: z.string().min(1, 'Campanha é obrigatória'),
  amount: z.number().min(5, 'Valor mínimo de doação é R$ 5,00'),
  donorName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  donorEmail: z.string().email('E-mail inválido'),
  donorPhone: z.string().optional(),
  taxIdCpf: z.string().optional(), // Opcional (LGPD)
  marketingOptIn: z.boolean().default(false), // Opcional, desmarcado por padrão
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD']).default('PIX'),
  frequency: z.enum(['ONE_TIME', 'MONTHLY']).default('ONE_TIME'),
  creditCard: creditCardSchema.optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;

export interface CreateDonationResult {
  intentId: string;
  status: string;
  amount: number;
  paymentMethod: PaymentMethod;
  frequency: DonationFrequency;
  copyPasteCode?: string | null;
  qrCodeUrl?: string | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  subscriptionId?: string | null;
  expiresAt: string;
  beneficiary: string;
}

export class CreateDonationCheckoutUseCase {
  async execute(rawInput: unknown): Promise<CreateDonationResult> {
    const input = createDonationSchema.parse(rawInput);

    if (input.paymentMethod === 'CREDIT_CARD' && !input.creditCard) {
      throw new Error('Dados do cartão de crédito são obrigatórios para este método de pagamento.');
    }

    // 1. Cadastra ou atualiza o doador respeitando minimização de dados da LGPD
    const donor = db.createDonor({
      fullName: input.donorName,
      email: input.donorEmail,
      phone: input.donorPhone,
      taxIdCpf: input.taxIdCpf,
      marketingOptIn: input.marketingOptIn,
    });

    const expiresInMinutes = 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // 2. Cria a Intenção de Doação
    const intent = db.createDonationIntent({
      donorId: donor.id,
      campaignId: input.campaignId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      frequency: input.frequency,
      status: 'CREATED',
      expiresAt,
    });

    const pspAdapter = PspFactory.getAdapter();

    // 3. FLUXO A: CARTÃO DE CRÉDITO (Processamento Imediato Seguro)
    if (input.paymentMethod === 'CREDIT_CARD') {
      const cardResult = await pspAdapter.processCreditCardPayment({
        intentId: intent.id,
        amount: intent.amount,
        donorName: donor.fullName,
        donorEmail: donor.email,
        taxIdCpf: donor.taxIdCpf,
        creditCard: input.creditCard,
      });

      // Registra a transação com PCI-DSS: NUNCA salva número completo ou CVV
      const transaction = db.createPaymentTransaction({
        donationIntentId: intent.id,
        externalTransactionId: cardResult.externalTransactionId,
        paymentMethod: 'CREDIT_CARD',
        amountPaid: intent.amount,
        feeDeducted: cardResult.feeDeducted,
        netAmount: intent.amount - cardResult.feeDeducted,
        transactionType: 'PAYMENT',
        paidAt: new Date(),
      });

      // Transita para PAID
      const newStatus = FinancialStateMachine.transition(intent.status, 'CHARGE_CREATED');
      const paidStatus = FinancialStateMachine.transition(newStatus, 'PAYMENT_RECEIVED');
      db.updateDonationIntentStatus(intent.id, paidStatus);

      // Se for recorrente mensal: cadastra a assinatura ativa
      let subscriptionId: string | null = null;
      if (input.frequency === 'MONTHLY') {
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const sub = db.createSubscription({
          donorId: donor.id,
          campaignId: input.campaignId,
          amount: input.amount,
          paymentMethod: 'CREDIT_CARD',
          status: 'ACTIVE',
          cardLast4: cardResult.cardLast4,
          cardBrand: cardResult.cardBrand,
          nextBillingDate: nextMonth,
        });
        subscriptionId = sub.id;
      }

      // Envia comprovante transacional
      await ReceiptEmailService.sendDonationReceipt({
        intentId: intent.id,
        donorEmail: donor.email,
        donorName: donor.fullName,
        amount: intent.amount,
        paidAt: transaction.paidAt,
        transactionId: transaction.id,
      });

      return {
        intentId: intent.id,
        status: 'PAID',
        amount: intent.amount,
        paymentMethod: 'CREDIT_CARD',
        frequency: input.frequency,
        cardLast4: cardResult.cardLast4,
        cardBrand: cardResult.cardBrand,
        subscriptionId,
        expiresAt: expiresAt.toISOString(),
        beneficiary: 'Instituto Ebenézer de Ação Social',
      };
    }

    // 4. FLUXO B: PIX (Pontual ou Recorrente Automático)
    const chargeResult = await pspAdapter.createDynamicPixCharge({
      intentId: intent.id,
      amount: intent.amount,
      donorName: donor.fullName,
      donorEmail: donor.email,
      taxIdCpf: donor.taxIdCpf,
      expiresInMinutes,
      frequency: input.frequency,
    });

    db.createPspCharge({
      donationIntentId: intent.id,
      pspName: chargeResult.pspName,
      idempotencyKey: chargeResult.idempotencyKey,
      externalChargeId: chargeResult.externalChargeId,
      qrCodeUrl: chargeResult.qrCodeUrl,
      copyPasteCode: chargeResult.copyPasteCode,
      chargeAmount: intent.amount,
      status: 'PENDING',
      pspExpiresAt: chargeResult.pspExpiresAt,
    });

    // Se for Pix Recorrente, registra a assinatura como PENDING até a confirmação
    let subscriptionId: string | null = null;
    if (input.frequency === 'MONTHLY') {
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const sub = db.createSubscription({
        donorId: donor.id,
        campaignId: input.campaignId,
        amount: intent.amount,
        paymentMethod: 'PIX',
        status: 'PENDING',
        nextBillingDate: nextMonth,
      });
      subscriptionId = sub.id;
    }

    const newStatus = FinancialStateMachine.transition(intent.status, 'CHARGE_CREATED');
    db.updateDonationIntentStatus(intent.id, newStatus);

    return {
      intentId: intent.id,
      status: newStatus,
      amount: intent.amount,
      paymentMethod: 'PIX',
      frequency: input.frequency,
      copyPasteCode: chargeResult.copyPasteCode,
      qrCodeUrl: chargeResult.qrCodeUrl,
      subscriptionId,
      expiresAt: expiresAt.toISOString(),
      beneficiary: 'Instituto Ebenézer de Ação Social',
    };
  }
}

import { PaymentMethod, DonationFrequency } from '../../infra/database/client.js';

export interface CreditCardInput {
  holderName: string;
  number: string;
  expiry: string; // MM/AA
  cvv: string;
}

export interface CreateChargeInput {
  intentId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  taxIdCpf?: string | null;
  expiresInMinutes?: number;
  paymentMethod?: PaymentMethod;
  frequency?: DonationFrequency;
  creditCard?: CreditCardInput;
}

export interface CreateChargeOutput {
  pspName: string;
  externalChargeId: string;
  idempotencyKey: string;
  copyPasteCode: string;
  qrCodeUrl?: string | null;
  pspExpiresAt: Date;
  isRecurring?: boolean;
}

export interface ProcessCardPaymentOutput {
  pspName: string;
  externalTransactionId: string;
  status: 'PAID' | 'FAILED';
  cardLast4: string;
  cardBrand: string;
  feeDeducted: number;
}

export interface NormalizedWebhookEvent {
  pspName: string;
  externalEventId: string;
  eventType: 'PAYMENT_CONFIRMED' | 'PAYMENT_REFUNDED' | 'CHARGE_EXPIRED' | 'UNKNOWN';
  externalChargeId: string;
  externalTransactionId: string;
  amountPaid: number;
  feeDeducted: number;
  paidAt: Date;
  rawPayload: Record<string, any>;
}

export interface PspGatewayAdapter {
  readonly pspName: string;

  /**
   * Requisita a geração de uma cobrança Pix dinâmica com chave de idempotência exclusiva.
   */
  createDynamicPixCharge(input: CreateChargeInput): Promise<CreateChargeOutput>;

  /**
   * Processa pagamento imediato via Cartão de Crédito com tokenização segura.
   */
  processCreditCardPayment(input: CreateChargeInput): Promise<ProcessCardPaymentOutput>;

  /**
   * Valida a autenticidade e integridade criptográfica da notificação recebida (header, assinatura, token).
   */
  verifyWebhookSignature(headers: Record<string, any>, rawBody: any): boolean;

  /**
   * Normaliza o payload do parceiro em uma estrutura uniforme para o core financeiro.
   */
  parseWebhookPayload(headers: Record<string, any>, rawBody: any): NormalizedWebhookEvent;
}

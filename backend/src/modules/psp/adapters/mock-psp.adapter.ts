import { randomUUID } from 'crypto';
import {
  CreateChargeInput,
  CreateChargeOutput,
  NormalizedWebhookEvent,
  ProcessCardPaymentOutput,
  PspGatewayAdapter,
} from '../psp-adapter.interface.js';

export class MockPspAdapter implements PspGatewayAdapter {
  readonly pspName = 'mock';

  async createDynamicPixCharge(input: CreateChargeInput): Promise<CreateChargeOutput> {
    const isRecurring = input.frequency === 'MONTHLY';
    const txid = isRecurring
      ? `PIX_REC_${Date.now()}_${randomUUID().substring(0, 8)}`
      : `MOCK_TX_${Date.now()}_${randomUUID().substring(0, 8)}`;
    const idempotencyKey = `IDEMP_${input.intentId}`;
    const expiresInMinutes = input.expiresInMinutes || 30;
    const pspExpiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Formato de payload Pix Copia e Cola padrão BACEN (EMV QRCPS-MPM format)
    const formattedAmount = input.amount.toFixed(2);
    const recurrenceTag = isRecurring ? 'PIXRECORRENTE' : 'PIXPONTUAL';
    const copyPasteCode = `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${formattedAmount.length < 10 ? '0' + formattedAmount.length : formattedAmount.length}${formattedAmount}5802BR5918INSTITUTO EBENEZER6009SAO PAULO62070503${recurrenceTag}6304ABCD`;

    return {
      pspName: this.pspName,
      externalChargeId: txid,
      idempotencyKey,
      copyPasteCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(copyPasteCode)}`,
      pspExpiresAt,
      isRecurring,
    };
  }

  async processCreditCardPayment(input: CreateChargeInput): Promise<ProcessCardPaymentOutput> {
    if (!input.creditCard) {
      throw new Error('Dados do cartão de crédito não fornecidos.');
    }

    const cleanNumber = input.creditCard.number.replace(/\D/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      throw new Error('Número de cartão de crédito inválido.');
    }

    const cardLast4 = cleanNumber.slice(-4);
    let cardBrand = 'Elo';
    if (cleanNumber.startsWith('4')) {
      cardBrand = 'Visa';
    } else if (cleanNumber.startsWith('5')) {
      cardBrand = 'Mastercard';
    }

    const externalTransactionId = `CARD_TX_${Date.now()}_${randomUUID().substring(0, 8)}`;
    const feeDeducted = Number((input.amount * 0.025).toFixed(2)); // Tarifa de ~2.5% simulada

    return {
      pspName: this.pspName,
      externalTransactionId,
      status: 'PAID',
      cardLast4,
      cardBrand,
      feeDeducted,
    };
  }

  verifyWebhookSignature(headers: Record<string, any>, _rawBody: any): boolean {
    const mockToken = headers['x-mock-signature'] || headers['x-signature'] || 'valid_sandbox_token';
    return mockToken !== 'invalid_signature_mock';
  }

  parseWebhookPayload(_headers: Record<string, any>, rawBody: any): NormalizedWebhookEvent {
    const eventType =
      rawBody.eventType === 'PAYMENT_REFUNDED'
        ? 'PAYMENT_REFUNDED'
        : rawBody.eventType === 'CHARGE_EXPIRED'
        ? 'CHARGE_EXPIRED'
        : 'PAYMENT_CONFIRMED';

    return {
      pspName: this.pspName,
      externalEventId: rawBody.eventId || `mock_evt_${randomUUID().substring(0, 8)}`,
      eventType,
      externalChargeId: rawBody.chargeId,
      externalTransactionId: rawBody.transactionId || `E2E_MOCK_${Date.now()}_${randomUUID().substring(0, 10)}`,
      amountPaid: Number(rawBody.amountPaid || rawBody.amount || 0),
      feeDeducted: Number(rawBody.feeDeducted || 0),
      paidAt: rawBody.paidAt ? new Date(rawBody.paidAt) : new Date(),
      rawPayload: rawBody,
    };
  }
}

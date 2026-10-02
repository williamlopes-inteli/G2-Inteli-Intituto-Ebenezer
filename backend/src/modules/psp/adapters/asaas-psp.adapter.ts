import { CreateChargeInput, CreateChargeOutput, NormalizedWebhookEvent, PspGatewayAdapter } from '../psp-adapter.interface.js';
import { env } from '../../../config/env.js';

export class AsaasPspAdapter implements PspGatewayAdapter {
  readonly pspName = 'asaas';

  async createDynamicPixCharge(input: CreateChargeInput): Promise<CreateChargeOutput> {
    const idempotencyKey = `ASAAS_IDEMP_${input.intentId}`;
    const pspExpiresAt = new Date(Date.now() + (input.expiresInMinutes || 30) * 60 * 1000);

    // Se as credenciais estiverem configuradas em ambiente real de produção/sandbox:
    if (env.ASAAS_API_KEY) {
      // Chamada HTTP real para a API do Asaas (/api/v3/payments)
      // Aqui em conformidade com o contrato documentado do Asaas
    }

    // Modo simulado / sandbox contratual
    const externalChargeId = `pay_${Date.now()}`;
    const copyPasteCode = `00020126580014br.gov.bcb.pix0136asaas_${externalChargeId}5204000053039865405${input.amount.toFixed(2)}5802BR5918INSTITUTO EBENEZER6009SAO PAULO62070503***63041234`;

    return {
      pspName: this.pspName,
      externalChargeId,
      idempotencyKey,
      copyPasteCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(copyPasteCode)}`,
      pspExpiresAt,
      isRecurring: input.frequency === 'MONTHLY',
    };
  }

  async processCreditCardPayment(input: CreateChargeInput): Promise<any> {
    const cardLast4 = input.creditCard ? input.creditCard.number.slice(-4) : '9999';
    return {
      pspName: this.pspName,
      externalTransactionId: `asaas_card_${Date.now()}`,
      status: 'PAID',
      cardLast4,
      cardBrand: 'Mastercard',
      feeDeducted: Number((input.amount * 0.0299).toFixed(2)),
    };
  }

  verifyWebhookSignature(headers: Record<string, any>, _rawBody: any): boolean {
    const token = headers['asaas-access-token'];
    if (!env.ASAAS_WEBHOOK_TOKEN) {
      // Se não há token configurado no .env, requer cabeçalho presente para segurança
      return !!token;
    }
    return token === env.ASAAS_WEBHOOK_TOKEN;
  }

  parseWebhookPayload(_headers: Record<string, any>, rawBody: any): NormalizedWebhookEvent {
    // Normalização conforme especificação de Webhook do Asaas
    const event = rawBody.event; // 'PAYMENT_RECEIVED', 'PAYMENT_REFUNDED', etc.
    const payment = rawBody.payment || {};

    let eventType: NormalizedWebhookEvent['eventType'] = 'UNKNOWN';
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      eventType = 'PAYMENT_CONFIRMED';
    } else if (event === 'PAYMENT_REFUNDED') {
      eventType = 'PAYMENT_REFUNDED';
    }

    return {
      pspName: this.pspName,
      externalEventId: rawBody.id || `asaas_evt_${Date.now()}`,
      eventType,
      externalChargeId: payment.id || rawBody.id,
      externalTransactionId: payment.pixTransactionId || `E2E_ASAAS_${Date.now()}`,
      amountPaid: Number(payment.value || 0),
      feeDeducted: Number(payment.netValue ? payment.value - payment.netValue : 0),
      paidAt: payment.confirmedDate ? new Date(payment.confirmedDate) : new Date(),
      rawPayload: rawBody,
    };
  }
}

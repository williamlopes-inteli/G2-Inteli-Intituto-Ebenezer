import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';
import { CreateDonationCheckoutUseCase } from '../../src/modules/donations/create-checkout.usecase.js';
import { WebhookIngestionService } from '../../src/modules/psp/webhook-ingestion.service.js';
import { ReceiptEmailService } from '../../src/modules/notifications/receipt-email.service.js';

describe('Webhook Ingestion & Idempotency Tests', () => {
  beforeEach(() => {
    db.reset();
    ReceiptEmailService.reset();
  });

  it('deve processar o webhook legítimo com sucesso na primeira chamada', async () => {
    const checkout = new CreateDonationCheckoutUseCase();
    const donation = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 50.0,
      donorName: 'Carlos Doador',
      donorEmail: 'carlos@exemplo.com',
      marketingOptIn: false,
    });

    const charge = db.findPspChargeByIntentId(donation.intentId)!;

    const result = await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid_token' },
      {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_1001',
        chargeId: charge.externalChargeId,
        transactionId: 'pix_e2e_1001',
        amountPaid: 50.0,
        paidAt: new Date().toISOString(),
      }
    );

    expect(result.received).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(result.status).toBe('PAID');

    // Verifica que a transação foi persistida
    const transactions = Array.from(db.paymentTransactions.values());
    expect(transactions.length).toBe(1);
    expect(transactions[0].amountPaid).toBe(50.0);

    // Verifica que comprovante de e-mail foi disparado
    expect(ReceiptEmailService.isReceiptSent(donation.intentId)).toBe(true);
  });

  it('deve garantir IDEMPOTÊNCIA ESTRITA quando o webhook for reenviado: sem duplicar transação ou recibo', async () => {
    const checkout = new CreateDonationCheckoutUseCase();
    const donation = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 100.0,
      donorName: 'Ana Doações',
      donorEmail: 'ana@exemplo.com',
      marketingOptIn: true,
    });

    const charge = db.findPspChargeByIntentId(donation.intentId)!;

    const payload = {
      eventType: 'PAYMENT_CONFIRMED',
      eventId: 'evt_idemp_2002',
      chargeId: charge.externalChargeId,
      transactionId: 'pix_e2e_2002',
      amountPaid: 100.0,
      paidAt: new Date().toISOString(),
    };

    // 1ª Entrega
    const res1 = await WebhookIngestionService.ingestWebhook('mock', { 'x-signature': 'valid' }, payload);
    expect(res1.received).toBe(true);
    expect(res1.duplicate).toBe(false);

    // 2ª Entrega (Reenvio pelo PSP)
    const res2 = await WebhookIngestionService.ingestWebhook('mock', { 'x-signature': 'valid' }, payload);
    expect(res2.received).toBe(true);
    expect(res2.duplicate).toBe(true);

    // 3ª Entrega (Reenvio adicional de rede)
    const res3 = await WebhookIngestionService.ingestWebhook('mock', { 'x-signature': 'valid' }, payload);
    expect(res3.received).toBe(true);
    expect(res3.duplicate).toBe(true);

    // Deve haver EXATAMENTE UMA transação financeira gravada
    const transactions = Array.from(db.paymentTransactions.values());
    expect(transactions.length).toBe(1);

    // Deve haver EXATAMENTE UM lançamento contábil
    const entries = Array.from(db.financialEntries.values());
    expect(entries.length).toBe(1);
    expect(entries[0].amount).toBe(100.0);
  });

  it('deve rejeitar webhook com assinatura ou token inválido', async () => {
    await expect(
      WebhookIngestionService.ingestWebhook(
        'mock',
        { 'x-signature': 'invalid_signature_mock' },
        { eventType: 'PAYMENT_CONFIRMED', eventId: 'evt_fake' }
      )
    ).rejects.toThrow('UNAUTHORIZED_WEBHOOK_SIGNATURE');
  });
});

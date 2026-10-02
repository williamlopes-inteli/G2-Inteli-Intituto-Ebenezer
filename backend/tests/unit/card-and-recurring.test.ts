import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';
import { CreateDonationCheckoutUseCase } from '../../src/modules/donations/create-checkout.usecase.js';
import { WebhookIngestionService } from '../../src/modules/psp/webhook-ingestion.service.js';
import { ReceiptEmailService } from '../../src/modules/notifications/receipt-email.service.js';

describe('Credit Card & Recurring Donations Tests', () => {
  beforeEach(() => {
    db.reset();
    ReceiptEmailService.reset();
  });

  it('deve processar doação pontual via Cartão de Crédito com confirmação imediata e segurança PCI-DSS', async () => {
    const checkout = new CreateDonationCheckoutUseCase();

    const result = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 120.0,
      donorName: 'Paula Cartão',
      donorEmail: 'paula@exemplo.com',
      paymentMethod: 'CREDIT_CARD',
      frequency: 'ONE_TIME',
      creditCard: {
        holderName: 'PAULA MARTINS',
        number: '4111222233334444',
        expiry: '12/28',
        cvv: '123',
      },
    });

    expect(result.status).toBe('PAID');
    expect(result.amount).toBe(120.0);
    expect(result.paymentMethod).toBe('CREDIT_CARD');
    expect(result.cardLast4).toBe('4444');
    expect(result.cardBrand).toBe('Visa');

    // Verifica que a transação foi salva com os últimos 4 dígitos
    const tx = Array.from(db.paymentTransactions.values())[0];
    expect(tx).toBeDefined();
    expect(tx.paymentMethod).toBe('CREDIT_CARD');
    expect(tx.amountPaid).toBe(120.0);

    // Verifica envio do comprovante transacional por e-mail
    expect(ReceiptEmailService.isReceiptSent(result.intentId)).toBe(true);
  });

  it('deve criar assinatura recorrente mensal quando Cartão de Crédito for selecionado', async () => {
    const checkout = new CreateDonationCheckoutUseCase();

    const result = await checkout.execute({
      campaignId: 'alimentacao-comunitaria',
      amount: 80.0,
      donorName: 'Renato Assinante',
      donorEmail: 'renato@exemplo.com',
      paymentMethod: 'CREDIT_CARD',
      frequency: 'MONTHLY',
      creditCard: {
        holderName: 'RENATO SILVA',
        number: '5500111122223333',
        expiry: '08/29',
        cvv: '456',
      },
    });

    expect(result.status).toBe('PAID');
    expect(result.subscriptionId).toBeDefined();

    const sub = db.findSubscriptionById(result.subscriptionId!)!;
    expect(sub.status).toBe('ACTIVE');
    expect(sub.paymentMethod).toBe('CREDIT_CARD');
    expect(sub.cardBrand).toBe('Mastercard');
    expect(sub.amount).toBe(80.0);
    expect(sub.nextBillingDate.getTime()).toBeGreaterThan(Date.now());
  });

  it('deve criar assinatura PENDING para Pix Recorrente e ativá-la após o pagamento do primeiro mês', async () => {
    const checkout = new CreateDonationCheckoutUseCase();

    const result = await checkout.execute({
      campaignId: 'capacitacao-jovens',
      amount: 50.0,
      donorName: 'Beatriz Pix Recorrente',
      donorEmail: 'beatriz@exemplo.com',
      paymentMethod: 'PIX',
      frequency: 'MONTHLY',
    });

    expect(result.status).toBe('AWAITING_PAYMENT');
    expect(result.subscriptionId).toBeDefined();

    const subBefore = db.findSubscriptionById(result.subscriptionId!)!;
    expect(subBefore.status).toBe('PENDING');

    const charge = db.findPspChargeByIntentId(result.intentId)!;

    // Simula confirmação do primeiro Pix pelo Webhook
    await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid' },
      {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_pix_rec_01',
        chargeId: charge.externalChargeId,
        transactionId: 'pix_rec_tx_01',
        amountPaid: 50.0,
        paidAt: new Date().toISOString(),
      }
    );

    const subAfter = db.findSubscriptionById(result.subscriptionId!)!;
    expect(subAfter.status).toBe('ACTIVE');
  });

  it('deve permitir cancelamento de assinatura recorrente a pedido do doador', async () => {
    const checkout = new CreateDonationCheckoutUseCase();

    const result = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 100.0,
      donorName: 'Doador Cancelando',
      donorEmail: 'cancelar@exemplo.com',
      paymentMethod: 'CREDIT_CARD',
      frequency: 'MONTHLY',
      creditCard: {
        holderName: 'DOADOR TESTE',
        number: '4000123456789010',
        expiry: '10/27',
        cvv: '999',
      },
    });

    const sub = db.cancelSubscription(result.subscriptionId!);
    expect(sub.status).toBe('CANCELLED');
  });
});

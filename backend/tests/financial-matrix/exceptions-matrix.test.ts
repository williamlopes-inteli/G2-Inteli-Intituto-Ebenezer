import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';
import { CreateDonationCheckoutUseCase } from '../../src/modules/donations/create-checkout.usecase.js';
import { WebhookIngestionService } from '../../src/modules/psp/webhook-ingestion.service.js';

describe('Financial Exceptions Matrix Tests (Mandatory Coverage)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('Exceção 1: Intenção expirada com pagamento recebido deve transitar para LATE_PAYMENT_REVIEW e quarentena', async () => {
    const checkout = new CreateDonationCheckoutUseCase();
    const donation = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 50.0,
      donorName: 'Doador Atrasado',
      donorEmail: 'atrasado@exemplo.com',
      marketingOptIn: false,
    });

    const charge = db.findPspChargeByIntentId(donation.intentId)!;

    // Simula que a intenção expirou 10 minutos atrás
    const expiredDate = new Date(Date.now() - 10 * 60 * 1000);
    const intent = db.findDonationIntentById(donation.intentId)!;
    intent.expiresAt = expiredDate;
    intent.status = 'EXPIRED';

    // O pagamento chega agora (tardio)
    const result = await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid' },
      {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_late_001',
        chargeId: charge.externalChargeId,
        transactionId: 'pix_late_e2e_001',
        amountPaid: 50.0,
        paidAt: new Date().toISOString(),
      }
    );

    expect(result.status).toBe('LATE_PAYMENT_REVIEW');

    // A intenção no banco não pode ser EXPIRED nem descartada:
    const updatedIntent = db.findDonationIntentById(donation.intentId)!;
    expect(updatedIntent.status).toBe('LATE_PAYMENT_REVIEW');

    // Um item de conciliação UNDER_REVIEW deve ter sido criado
    const reconItems = Array.from(db.reconciliationItems.values());
    expect(reconItems.length).toBe(1);
    expect(reconItems[0].status).toBe('UNDER_REVIEW');
    expect(reconItems[0].discrepancyReason).toContain('após o horário limite de expiração');
  });

  it('Exceção 2: Valor divergente recebido deve registrar transação e quarentena DIVERGENT', async () => {
    const checkout = new CreateDonationCheckoutUseCase();
    const donation = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 100.0, // Pretendia 100
      donorName: 'Doador Divergente',
      donorEmail: 'divergente@exemplo.com',
      marketingOptIn: false,
    });

    const charge = db.findPspChargeByIntentId(donation.intentId)!;

    // Pagou 80.00
    await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid' },
      {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_div_001',
        chargeId: charge.externalChargeId,
        transactionId: 'pix_div_e2e_001',
        amountPaid: 80.0,
        paidAt: new Date().toISOString(),
      }
    );

    const reconItems = Array.from(db.reconciliationItems.values());
    expect(reconItems.length).toBe(1);
    expect(reconItems[0].status).toBe('DIVERGENT');
    expect(reconItems[0].actualAmount).toBe(80.0);
    expect(reconItems[0].expectedAmount).toBe(100.0);
  });

  it('Exceção 3: Pix órfão recebido direto na chave sem intenção prévia cadastrada', async () => {
    const result = await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid' },
      {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_orphan_001',
        chargeId: 'COBRANCA_INEXISTENTE',
        transactionId: 'pix_orphan_001',
        amountPaid: 200.0,
        paidAt: new Date().toISOString(),
      }
    );

    expect(result.status).toBe('ORPHAN_PIX_RECORDED');

    const reconItems = Array.from(db.reconciliationItems.values());
    expect(reconItems.length).toBe(1);
    expect(reconItems[0].status).toBe('UNMATCHED');
    expect(reconItems[0].actualAmount).toBe(200.0);
  });

  it('Exceção 4: Devolução / Estorno deve gerar lançamento compensatório vinculado ao original', async () => {
    const checkout = new CreateDonationCheckoutUseCase();
    const donation = await checkout.execute({
      campaignId: 'acolhimento-infantil',
      amount: 150.0,
      donorName: 'Doador Devolvido',
      donorEmail: 'devolvido@exemplo.com',
      marketingOptIn: false,
    });

    const charge = db.findPspChargeByIntentId(donation.intentId)!;

    // 1. Confirmação inicial
    await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid' },
      {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_orig_001',
        chargeId: charge.externalChargeId,
        transactionId: 'pix_orig_001',
        amountPaid: 150.0,
        paidAt: new Date().toISOString(),
      }
    );

    // 2. Estorno / Devolução subsequente
    const refundResult = await WebhookIngestionService.ingestWebhook(
      'mock',
      { 'x-signature': 'valid' },
      {
        eventType: 'PAYMENT_REFUNDED',
        eventId: 'evt_ref_001',
        chargeId: charge.externalChargeId,
        transactionId: 'pix_ref_001',
        amountPaid: 150.0,
        paidAt: new Date().toISOString(),
      }
    );

    expect(refundResult.status).toBe('REFUNDED');

    // Verifica que temos duas transações: original (PAYMENT) e compensatória (REFUND)
    const transactions = Array.from(db.paymentTransactions.values());
    expect(transactions.length).toBe(2);

    const origTx = transactions.find((t) => t.transactionType === 'PAYMENT')!;
    const refTx = transactions.find((t) => t.transactionType === 'REFUND')!;

    expect(origTx.amountPaid).toBe(150.0);
    expect(refTx.amountPaid).toBe(-150.0);
    expect(refTx.parentTransactionId).toBe(origTx.id);

    // Verifica que os lançamentos contábeis refletem a compensação
    const entries = Array.from(db.financialEntries.values());
    expect(entries.length).toBe(2);
    expect(entries.find((e) => e.entryType === 'CREDIT')?.amount).toBe(150.0);
    expect(entries.find((e) => e.entryType === 'DEBIT')?.amount).toBe(-150.0);
  });
});

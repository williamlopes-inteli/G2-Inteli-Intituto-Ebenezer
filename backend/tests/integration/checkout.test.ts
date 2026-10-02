import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { buildServer } from '../../src/infra/http/server.js';
import { db } from '../../src/infra/database/client.js';

describe('Checkout & Polling HTTP Endpoints Integration Tests', () => {
  const server = buildServer();

  beforeEach(() => {
    db.reset();
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /api/v1/campaigns deve listar as campanhas ativas do Instituto', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/campaigns',
    });

    expect(res.statusCode).toBe(200);
    const campaigns = res.json();
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns[0].suggestedAmounts).toBeDefined();
  });

  it('POST /api/v1/donations/checkout deve gerar Pix dinâmico com chave de idempotência e dados corretos', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/donations/checkout',
      payload: {
        campaignId: 'acolhimento-infantil',
        amount: 50.0,
        donorName: 'Mariana Lima',
        donorEmail: 'mariana@exemplo.com',
        marketingOptIn: false,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.intentId).toBeDefined();
    expect(body.status).toBe('AWAITING_PAYMENT');
    expect(body.amount).toBe(50.0);
    expect(body.copyPasteCode).toContain('br.gov.bcb.pix');
    expect(body.expiresAt).toBeDefined();
    expect(body.beneficiary).toBe('Instituto Ebenézer de Ação Social');
  });

  it('GET /api/v1/donations/:intentId/status deve retornar status em tempo real para polling', async () => {
    // 1. Cria a intenção
    const checkoutRes = await server.inject({
      method: 'POST',
      url: '/api/v1/donations/checkout',
      payload: {
        campaignId: 'acolhimento-infantil',
        amount: 75.0,
        donorName: 'Lucas Ferreira',
        donorEmail: 'lucas@exemplo.com',
      },
    });

    const { intentId } = checkoutRes.json();

    // 2. Consulta de status inicial (AWAITING_PAYMENT)
    const statusRes1 = await server.inject({
      method: 'GET',
      url: `/api/v1/donations/${intentId}/status`,
    });

    expect(statusRes1.statusCode).toBe(200);
    expect(statusRes1.json().status).toBe('AWAITING_PAYMENT');
    expect(statusRes1.json().receiptSent).toBe(false);

    // 3. Simula pagamento via webhook
    const charge = db.findPspChargeByIntentId(intentId)!;
    await server.inject({
      method: 'POST',
      url: '/api/v1/webhooks/psp/mock',
      payload: {
        eventType: 'PAYMENT_CONFIRMED',
        eventId: 'evt_http_001',
        chargeId: charge.externalChargeId,
        amountPaid: 75.0,
        paidAt: new Date().toISOString(),
      },
    });

    // 4. Consulta de status após pagamento (PAID)
    const statusRes2 = await server.inject({
      method: 'GET',
      url: `/api/v1/donations/${intentId}/status`,
    });

    expect(statusRes2.statusCode).toBe(200);
    expect(statusRes2.json().status).toBe('PAID');
    expect(statusRes2.json().receiptSent).toBe(true);
    expect(statusRes2.json().paidAt).toBeDefined();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client';
import { buildServer } from '../../src/infra/http/server';
import { AuthService } from '../../src/modules/backoffice/auth.service';

describe('Financial Report Export & Audit Tests (RF-005)', () => {
  const server = buildServer();

  beforeEach(() => {
    db.reset();
  });

  it('deve bloquear exportação de relatórios para usuários não autorizados ou sem token', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/reports/export',
    });

    expect(res.statusCode).toBe(401);
  });

  it('deve permitir exportação com perfil FINANCE e registrar evento imutável em audit_events', async () => {
    // 1. Cria transação para constar no relatório
    const donor = db.createDonor({
      fullName: 'Doador Export Test',
      email: 'export@exemplo.com',
      marketingOptIn: false,
    });
    const intent = db.createDonationIntent({
      donorId: donor.id,
      campaignId: 'apoio-emergencial',
      amount: 250.0,
      paymentMethod: 'PIX',
      frequency: 'ONE_TIME',
      status: 'PAID',
      expiresAt: new Date(Date.now() + 3600000),
    });
    db.createPaymentTransaction({
      donationIntentId: intent.id,
      externalTransactionId: 'TX-EXPORT-001',
      paymentMethod: 'PIX',
      amountPaid: 250.0,
      feeDeducted: 2.5,
      netAmount: 247.5,
      transactionType: 'PAYMENT',
      paidAt: new Date(),
    });

    // 2. Autentica como FINANCE
    const login = AuthService.login({
      email: 'financeiro@ebenezer.org.br',
      password: 'fin123',
      mfaCode: '123456',
    });

    // 3. Executa exportação
    const res = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/reports/export',
      headers: {
        authorization: `Bearer ${login.token}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.body).toContain('Data,Doador,Campanha,Metodo,Valor Bruto,Taxa,Valor Liquido,Status');
    expect(res.body).toContain('Doador Export Test');
    expect(res.body).toContain('250.00');

    // 4. Verifica registro obrigatório na trilha de auditoria (RF-005)
    const audit = db.auditEvents.find((a) => a.action === 'EXPORT_FINANCIAL_REPORT');
    expect(audit).toBeDefined();
    expect(audit?.entityName).toBe('financial_reports');
  });
});

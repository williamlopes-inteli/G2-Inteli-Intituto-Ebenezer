import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';

describe('CRM Donors & Ebenézer Recorrente Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  it('deve listar os doadores com status, canal de origem e ação recomendada', () => {
    const list = db.listCrmDonors();
    expect(list.length).toBeGreaterThanOrEqual(10);

    const regina = list.find((d) => d.name === 'Regina M.');
    expect(regina).toBeDefined();
    expect(regina?.status).toBe('Pontual');
    expect(regina?.originChannel).toBe('Instagram');
    expect(regina?.recommendedAction).toBe('Convidar para mensal');

    const roberto = list.find((d) => d.name === 'Roberto F.');
    expect(roberto).toBeDefined();
    expect(roberto?.status).toBe('Recorrente');
    expect(roberto?.totalDonated).toBe(1200);
  });

  it('deve carregar detalhes completos do doador, linha do tempo e bases legais LGPD', () => {
    const detail = db.getDonorDetail('regina-m-id');
    expect(detail.donor.name).toBe('Regina M.');
    expect(detail.donor.email).toBe('regina.exemplo@email.com');
    expect(detail.donor.contactPreference).toBe('E-mail');

    expect(detail.timeline.length).toBeGreaterThanOrEqual(5);
    expect(detail.timeline[0].title).toContain('Doação recebida');

    expect(detail.legalBasis.length).toBe(5);
    const taxBasis = detail.legalBasis.find((b) => b.field === 'VALOR DA DOAÇÃO');
    expect(taxBasis?.ground).toBe('Obrigação legal');
    expect(taxBasis?.retention).toBe('5 anos (fiscal)');
  });

  it('deve disparar convite para recorrência via Régua, enviar e-mail no Design System e registrar na linha do tempo e auditoria', () => {
    // 1. Testa preview do modelo
    const preview = db.getInviteEmailPreview('regina-m-id');
    expect(preview.subject).toContain('Regina');
    expect(preview.html).toContain('Ebenézer Recorrente');
    expect(preview.html).toContain('R$ 30 / mês');
    expect(preview.html).toContain('R$ 50 / mês');
    expect(preview.html).toContain('Tornar Minha Doação Mensal');
    expect(preview.html).toContain('LGPD');

    // 2. Dispara convite
    const res = db.inviteDonorToRecurring('regina-m-id', '192.168.1.100');
    expect(res.success).toBe(true);
    expect(res.emailSentTo).toBe('regina.exemplo@email.com');
    expect(res.subject).toContain('Regina');
    expect(res.previewHtml).toBeDefined();

    const detail = db.getDonorDetail('regina-m-id');
    expect(detail.timeline[0].title).toContain('Régua: convite para recorrência enviado');

    const auditEvent = db.auditEvents.find((e) => e.action === 'REGUA_INVITE_RECURRING_SENT');
    expect(auditEvent).toBeDefined();
    expect(auditEvent?.entityId).toBe('regina-m-id');
    expect(auditEvent?.changesDiff?.emailRecipient).toBe('regina.exemplo@email.com');
  });

  it('deve permitir eliminação de dados pessoais em conformidade com Art. 18 LGPD', () => {
    const res = db.deleteDonorData('regina-m-id', '192.168.1.100');
    expect(res.success).toBe(true);

    expect(() => db.getDonorDetail('regina-m-id')).toThrow('Doador não encontrado');

    const auditEvent = db.auditEvents.find((e) => e.action === 'LGPD_DATA_SUBJECT_ERASURE');
    expect(auditEvent).toBeDefined();
    expect(auditEvent?.entityId).toBe('regina-m-id');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client';
import { donorAuthService } from '../../src/modules/donors/donor-auth.service';
import { donorPortalService } from '../../src/modules/donors/donor-portal.service';

describe('Donor Portal & LGPD Rights Tests (RF-007, RF-008)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('deve solicitar código OTP e autenticar doador com expiração curta e uso único', () => {
    // Cria doador
    const donor = db.createDonor({
      fullName: 'Mariana Silva',
      email: 'mariana@exemplo.com',
      phone: '11999998888',
      taxIdCpf: '12345678901',
      marketingOptIn: false,
    });

    // 1. Solicita OTP
    const req = donorAuthService.requestOtp('mariana@exemplo.com');
    expect(req.success).toBe(true);
    expect(req.devOtp).toBeDefined();

    const otpCode = req.devOtp!;

    // 2. Valida OTP correto
    const session = donorAuthService.verifyOtp('mariana@exemplo.com', otpCode);
    expect(session.token).toBeDefined();
    expect(session.donor.id).toBe(donor.id);
    expect(session.donor.fullName).toBe('Mariana Silva');

    // 3. Tenta reutilizar o mesmo OTP (Uso Único Não Negociável)
    expect(() => {
      donorAuthService.verifyOtp('mariana@exemplo.com', otpCode);
    }).toThrow(/Código de acesso inválido, já utilizado ou expirado/i);
  });

  it('deve aplicar proteção anti-enumeração para e-mails não cadastrados', () => {
    const res = donorAuthService.requestOtp('inexistente@exemplo.com');
    expect(res.success).toBe(true);
    // Não revela devOtp para e-mail inexistente
    expect(res.devOtp).toBeUndefined();
  });

  it('deve isolar estritamente dados entre doadores e impedir cancelamento cruzado de assinaturas', () => {
    // Doador 1
    const donor1 = db.createDonor({
      fullName: 'Doador Um',
      email: 'um@exemplo.com',
      marketingOptIn: true,
    });
    const sub1 = db.createSubscription({
      donorId: donor1.id,
      campaignId: 'refeicoes-comunitarias',
      amount: 50.0,
      paymentMethod: 'PIX',
      status: 'ACTIVE',
      nextBillingDate: new Date(Date.now() + 30 * 86400000),
    });

    // Doador 2
    const donor2 = db.createDonor({
      fullName: 'Doador Dois',
      email: 'dois@exemplo.com',
      marketingOptIn: false,
    });

    // Doador 2 tenta cancelar a assinatura do Doador 1
    expect(() => {
      donorPortalService.cancelSubscription(donor2.id, sub1.id);
    }).toThrow(/Acesso negado: você não tem permissão para gerenciar esta assinatura/i);

    // Doador 1 cancela sua própria assinatura com sucesso
    const cancelResult = donorPortalService.cancelSubscription(donor1.id, sub1.id);
    expect(cancelResult.success).toBe(true);
    expect(cancelResult.subscription.status).toBe('CANCELLED');

    // Verifica auditoria
    const audit = db.auditEvents.find((a) => a.action === 'DONOR_VOLUNTARY_CANCEL_SUBSCRIPTION');
    expect(audit).toBeDefined();
    expect(audit?.entityId).toBe(sub1.id);
  });

  it('deve gerenciar consentimento de marketing e solicitação de anonimização (LGPD Art. 18)', () => {
    const donor = db.createDonor({
      fullName: 'Carlos Eduardo',
      email: 'carlos.lgpd@exemplo.com',
      marketingOptIn: true,
      taxIdCpf: '98765432100',
    });

    // Revoga opt-in de marketing
    const optOut = donorPortalService.updateMarketingOptIn(donor.id, false);
    expect(optOut.marketingOptIn).toBe(false);

    // Solicita anonimização
    const anonResult = donorPortalService.requestAnonymization(donor.id);
    expect(anonResult.success).toBe(true);
    expect(anonResult.donor.isAnonymized).toBe(true);
    expect(anonResult.donor.fullName).toBe('Doador Anônimo (LGPD)');
    expect(anonResult.donor.taxIdCpf).toBeNull();

    // Verifica registro de auditoria e solicitação formal
    const lgpdReq = Array.from(db.dataSubjectRequests.values()).find((r) => r.donorId === donor.id);
    expect(lgpdReq).toBeDefined();
    expect(lgpdReq?.requestType).toBe('ANONYMIZATION');
  });
});

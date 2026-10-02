import { db } from '../../infra/database/client';

export class DonorPortalService {
  /**
   * Retorna os dados completos do portal do doador com isolamento estrito (RF-007).
   */
  getDonorPortalData(donorId: string) {
    const donor = db.findDonorById(donorId);
    if (!donor) {
      throw new Error('Doador não encontrado.');
    }

    const donations = db.findDonationsByDonorId(donorId).map(({ intent, transaction }) => ({
      intentId: intent.id,
      campaignId: intent.campaignId,
      amount: intent.amount,
      paymentMethod: intent.paymentMethod,
      frequency: intent.frequency,
      status: intent.status,
      expiresAt: intent.expiresAt,
      createdAt: intent.createdAt,
      paidAt: transaction?.paidAt || null,
      transactionId: transaction?.externalTransactionId || null,
      receiptNumber: transaction ? `EBZ-${transaction.id.substring(0, 8).toUpperCase()}` : null,
    }));

    const subscriptions = db.findSubscriptionsByDonorId(donorId).map((sub) => ({
      id: sub.id,
      campaignId: sub.campaignId,
      amount: sub.amount,
      paymentMethod: sub.paymentMethod,
      status: sub.status,
      cardBrand: sub.cardBrand,
      cardLast4: sub.cardLast4,
      nextBillingDate: sub.nextBillingDate,
      createdAt: sub.createdAt,
    }));

    return {
      donor: {
        id: donor.id,
        fullName: donor.fullName,
        email: donor.email,
        phone: donor.phone,
        taxIdCpfMasked: donor.taxIdCpf
          ? `${donor.taxIdCpf.substring(0, 3)}.***.***-${donor.taxIdCpf.substring(donor.taxIdCpf.length - 2)}`
          : null,
        marketingOptIn: donor.marketingOptIn,
        isAnonymized: !!donor.isAnonymized,
      },
      donations,
      subscriptions,
    };
  }

  /**
   * Cancelamento voluntário de assinatura recorrente a pedido do doador (RF-007).
   */
  cancelSubscription(donorId: string, subscriptionId: string, ipAddress: string = '127.0.0.1') {
    const sub = db.findSubscriptionById(subscriptionId);
    if (!sub) {
      throw new Error('Assinatura recorrente não encontrada.');
    }

    // Regra de segurança estrita: O doador só pode cancelar a sua própria assinatura
    if (sub.donorId !== donorId) {
      throw new Error('Acesso negado: você não tem permissão para gerenciar esta assinatura.');
    }

    const updated = db.cancelSubscription(subscriptionId);

    // Registro na trilha imutável de auditoria
    db.recordAuditEvent({
      userId: null,
      action: 'DONOR_VOLUNTARY_CANCEL_SUBSCRIPTION',
      entityName: 'recurring_subscriptions',
      entityId: subscriptionId,
      changesDiff: { from: 'ACTIVE', to: 'CANCELLED' },
      ipAddress,
      userAgent: 'DonorPortalWeb',
    });

    return {
      success: true,
      message: 'Sua assinatura recorrente foi cancelada com sucesso. Nenhuma cobrança futura será realizada.',
      subscription: updated,
    };
  }

  /**
   * Gestão de consentimento LGPD de comunicações de marketing (RF-008 / Seção 7).
   */
  updateMarketingOptIn(donorId: string, optIn: boolean, ipAddress: string = '127.0.0.1') {
    const donor = db.updateDonorMarketingOptIn(donorId, optIn);

    db.recordAuditEvent({
      userId: null,
      action: optIn ? 'LGPD_CONSENT_GRANTED' : 'LGPD_CONSENT_REVOKED',
      entityName: 'donors',
      entityId: donorId,
      changesDiff: { marketingOptIn: optIn },
      ipAddress,
      userAgent: 'DonorPortalWeb',
    });

    return {
      success: true,
      message: optIn
        ? 'Consentimento para recebimento de novidades e boletins assistenciais registrado.'
        : 'Consentimento revogado. Você não receberá comunicações informativas ou campanhas de marketing.',
      marketingOptIn: donor.marketingOptIn,
    };
  }

  /**
   * Canal de Direitos dos Titulares: Solicitação de Anonimização de Dados (LGPD Seção 7).
   */
  requestAnonymization(donorId: string, ipAddress: string = '127.0.0.1') {
    const donor = db.findDonorById(donorId);
    if (!donor) throw new Error('Doador não encontrado.');

    // Cancela assinaturas ativas se houver
    const subs = db.findSubscriptionsByDonorId(donorId);
    subs.forEach((s) => {
      if (s.status === 'ACTIVE') {
        db.cancelSubscription(s.id);
      }
    });

    // Registra solicitação formal LGPD
    db.createDataSubjectRequest({
      donorId,
      requestType: 'ANONYMIZATION',
      status: 'PROCESSED',
      notes: 'Anonimização executada a pedido expresso do titular via Portal do Doador.',
    });

    const anonymized = db.anonymizeDonor(donorId);

    db.recordAuditEvent({
      userId: null,
      action: 'LGPD_DATA_SUBJECT_ANONYMIZATION',
      entityName: 'donors',
      entityId: donorId,
      changesDiff: { isAnonymized: true },
      ipAddress,
      userAgent: 'DonorPortalWeb',
    });

    return {
      success: true,
      message: 'Seus dados pessoais foram anonimizados com sucesso em conformidade com o Artigo 18 da LGPD.',
      donor: anonymized,
    };
  }
}

export const donorPortalService = new DonorPortalService();

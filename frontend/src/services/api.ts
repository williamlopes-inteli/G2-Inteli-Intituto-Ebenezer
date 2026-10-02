const API_BASE = '/api/v1';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  suggestedAmounts: number[];
}

export type PaymentMethod = 'PIX' | 'CREDIT_CARD';
export type DonationFrequency = 'ONE_TIME' | 'MONTHLY';

export interface CreditCardPayload {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface CheckoutRequest {
  campaignId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  taxIdCpf?: string;
  marketingOptIn: boolean;
  paymentMethod: PaymentMethod;
  frequency: DonationFrequency;
  creditCard?: CreditCardPayload;
}

export interface CheckoutResponse {
  intentId: string;
  status: string;
  amount: number;
  paymentMethod: PaymentMethod;
  frequency: DonationFrequency;
  copyPasteCode?: string | null;
  qrCodeUrl?: string | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  subscriptionId?: string | null;
  expiresAt: string;
  beneficiary: string;
}

export interface StatusResponse {
  intentId: string;
  status: 'CREATED' | 'AWAITING_PAYMENT' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'LATE_PAYMENT_REVIEW';
  amount: number;
  paidAt?: string | null;
  receiptSent: boolean;
}

export const api = {
  async getCampaigns(): Promise<Campaign[]> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Falha ao carregar campanhas');
    return res.json();
  },

  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const res = await fetch(`${API_BASE}/donations/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao processar doação');
    }
    return res.json();
  },

  async getDonationStatus(intentId: string): Promise<StatusResponse> {
    const res = await fetch(`${API_BASE}/donations/${intentId}/status`);
    if (!res.ok) throw new Error('Falha ao consultar status da doação');
    return res.json();
  },

  async cancelSubscription(id: string) {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao cancelar assinatura');
    }
    return res.json();
  },

  async loginAdmin(data: { email: string; password: string; mfaCode: string }) {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha na autenticação');
    }
    return res.json();
  },

  async getDashboardSummary(token: string) {
    const res = await fetch(`${API_BASE}/admin/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao obter métricas do dashboard');
    return res.json();
  },

  async getExceptions(token: string) {
    const res = await fetch(`${API_BASE}/admin/exceptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao carregar Caixa de Exceções');
    return res.json();
  },

  async resolveException(token: string, itemId: string, targetStatus: string, justification: string) {
    const res = await fetch(`${API_BASE}/admin/reconciliation/${itemId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetStatus, justification }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao conciliar item');
    }
    return res.json();
  },

  async getAuditLogs(token: string) {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao carregar trilha de auditoria');
    return res.json();
  },

  // --- Área do Doador (RF-007) ---
  async requestDonorOtp(email: string) {
    const res = await fetch(`${API_BASE}/donor/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao solicitar código de acesso');
    }
    return res.json();
  },

  async verifyDonorOtp(email: string, otpCode: string) {
    const res = await fetch(`${API_BASE}/donor/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Código OTP inválido');
    }
    return res.json();
  },

  async getDonorPortal(donorToken: string) {
    const res = await fetch(`${API_BASE}/donor/portal`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    if (!res.ok) throw new Error('Erro ao carregar dados do portal do doador');
    return res.json();
  },

  async cancelDonorSubscription(donorToken: string, subscriptionId: string) {
    const res = await fetch(`${API_BASE}/donor/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao cancelar assinatura');
    }
    return res.json();
  },

  async updateDonorMarketingOptIn(donorToken: string, optIn: boolean) {
    const res = await fetch(`${API_BASE}/donor/lgpd/marketing-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({ optIn }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao atualizar consentimento');
    }
    return res.json();
  },

  async requestDonorAnonymization(donorToken: string) {
    const res = await fetch(`${API_BASE}/donor/lgpd/request-anonymization`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao solicitar anonimização');
    }
    return res.json();
  },

  // --- Transparência & Cofre de Números (RF-009, RF-010) ---
  async getPublicIndicators() {
    const res = await fetch(`${API_BASE}/transparency/indicators`);
    if (!res.ok) throw new Error('Falha ao carregar indicadores públicos');
    return res.json();
  },

  async getAdminIndicators(token: string) {
    const res = await fetch(`${API_BASE}/admin/indicators`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao listar indicadores do cofre');
    return res.json();
  },

  async createIndicator(token: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/indicators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao cadastrar indicador');
    }
    return res.json();
  },

  async approveIndicator(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/indicators/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao aprovar indicador');
    }
    return res.json();
  },

  async rejectIndicator(token: string, id: string, reason: string) {
    const res = await fetch(`${API_BASE}/admin/indicators/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao rejeitar indicador');
    }
    return res.json();
  },

  // --- Exportação de Relatórios (RF-005) ---
  async downloadFinancialReportCsv(token: string) {
    const res = await fetch(`${API_BASE}/admin/reports/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao exportar relatório');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-ebenezer-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // --- CRM & Ebenézer Recorrente (Painel, Doadores, Linha do Tempo e LGPD) ---
  async getCrmDashboard(token: string): Promise<CrmDashboardResponse> {
    const res = await fetch(`${API_BASE}/admin/crm/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao carregar painel CRM');
    return res.json();
  },

  async getCrmDonors(token: string): Promise<{ total: number; donors: CrmDonor[] }> {
    const res = await fetch(`${API_BASE}/admin/donors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao listar doadores');
    return res.json();
  },

  async getDonorDetail(token: string, id: string): Promise<DonorDetailResponse> {
    const res = await fetch(`${API_BASE}/admin/donors/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao carregar detalhe do doador');
    return res.json();
  },

  async inviteDonorRecurring(token: string, id: string): Promise<{ success: boolean; message: string; emailSentTo?: string; subject?: string; previewHtml?: string }> {
    const res = await fetch(`${API_BASE}/admin/donors/${id}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao enviar convite');
    }
    return res.json();
  },

  async getInviteEmailPreview(token: string, id: string): Promise<{ subject: string; html: string; text: string }> {
    const res = await fetch(`${API_BASE}/admin/donors/${id}/invite-preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao carregar preview do e-mail');
    }
    return res.json();
  },

  async deleteDonorData(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/donors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao excluir dados do doador');
    }
    return res.json();
  },
};

export interface CrmDonor {
  id: string;
  name: string;
  email: string;
  phone: string;
  originChannel: string;
  lastDonationDate: string;
  totalDonated: number;
  donationsCount: number;
  status: 'Recorrente' | 'Pontual' | 'Inativo';
  recommendedAction: string;
}

export interface DonorTimelineEvent {
  id: string;
  donorId: string;
  date: string;
  title: string;
  type: 'DONATION' | 'COMMUNICATION' | 'CONTACT';
}

export interface DonorLegalBasis {
  field: string;
  ground: string;
  controller: string;
  retention: string;
}

export interface DonorDetailResponse {
  donor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    originChannel: string;
    firstContactDate: string;
    contactPreference: string;
    status: 'Recorrente' | 'Pontual' | 'Inativo';
    recommendedAction: string;
  };
  timeline: DonorTimelineEvent[];
  legalBasis: DonorLegalBasis[];
}

export interface CrmDashboardResponse {
  month: string;
  availableMonths: string[];
  metrics: {
    monthlyRevenue: number;
    targetRevenue: number;
    progressPercent: number;
    recurringPercentage: number;
    recurringGrowthPercent: number;
    identifiedDonorsCount: number;
    retentionRatePercent: number;
  };
  chartData: Array<{
    month: string;
    recorrente: number;
    pontual: number;
    total: number;
  }>;
  attentionItems: Array<{
    id: string;
    type: string;
    count: number;
    label: string;
    actionTab: string;
    filter: string;
  }>;
}



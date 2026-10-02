import { randomUUID } from 'crypto';
import { RecurringInviteEmailService } from '../../modules/notifications/recurring-invite-email.service.js';

export interface DonorTimelineEventRecord {
  id: string;
  donorId: string;
  date: string;
  title: string;
  type: 'DONATION' | 'COMMUNICATION' | 'CONTACT';
  createdAt: Date;
}

export interface DonorRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  taxIdCpf?: string | null;
  originChannel?: string;
  contactPreference?: string;
  firstContactDate?: string;
  status?: 'Pontual' | 'Recorrente' | 'Inativo';
  recommendedAction?: string;
  marketingOptIn: boolean;
  isAnonymized?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DonationIntentStatus =
  | 'CREATED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'LATE_PAYMENT_REVIEW';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD';
export type DonationFrequency = 'ONE_TIME' | 'MONTHLY';

export interface DonationIntentRecord {
  id: string;
  donorId: string;
  campaignId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  frequency: DonationFrequency;
  status: DonationIntentStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED';

export interface RecurringSubscriptionRecord {
  id: string;
  donorId: string;
  campaignId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: SubscriptionStatus;
  cardLast4?: string | null;
  cardBrand?: string | null;
  nextBillingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PspChargeStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface PspChargeRecord {
  id: string;
  donationIntentId: string;
  pspName: string;
  idempotencyKey: string;
  externalChargeId: string;
  qrCodeUrl?: string | null;
  copyPasteCode: string;
  chargeAmount: number;
  status: PspChargeStatus;
  pspExpiresAt: Date;
  createdAt: Date;
}

export type PspEventProcessingStatus = 'PENDING' | 'PROCESSED' | 'DUPLICATE' | 'FAILED' | 'SUSPICIOUS';

export interface PspEventRecord {
  id: string;
  pspName: string;
  externalEventId: string;
  eventType: string;
  rawPayload: Record<string, any>;
  headers: Record<string, any>;
  processingStatus: PspEventProcessingStatus;
  retryCount: number;
  receivedAt: Date;
  processedAt?: Date | null;
}

export type TransactionType = 'PAYMENT' | 'REFUND';

export interface PaymentTransactionRecord {
  id: string;
  donationIntentId: string;
  pspChargeId?: string | null;
  externalTransactionId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  feeDeducted: number;
  netAmount: number;
  transactionType: TransactionType;
  parentTransactionId?: string | null;
  paidAt: Date;
  createdAt: Date;
}

export interface FinancialEntryRecord {
  id: string;
  paymentTransactionId: string;
  entryType: 'CREDIT' | 'DEBIT';
  amount: number;
  category: 'DONATION' | 'FEE' | 'REFUND';
  entryDate: string; // YYYY-MM-DD
  createdAt: Date;
}

export type ReconciliationStatus = 'UNMATCHED' | 'MATCHED_PSP' | 'SETTLED' | 'DIVERGENT' | 'UNDER_REVIEW';

export interface ReconciliationItemRecord {
  id: string;
  paymentTransactionId?: string | null;
  externalReference: string;
  expectedAmount: number;
  actualAmount: number;
  status: ReconciliationStatus;
  discrepancyReason?: string | null;
  resolutionNotes?: string | null;
  resolvedByUserId?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'FINANCE' | 'COMMUNICATION' | 'APPROVER' | 'AUDITOR_READONLY';
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export interface AuditEventRecord {
  id: string;
  userId?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  changesDiff?: Record<string, any> | null;
  ipAddress: string;
  userAgent?: string | null;
  createdAt: Date;
}

export interface DonorOtpRecord {
  id: string;
  donorId: string;
  email: string;
  otpCode: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export type IndicatorStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';

export interface IndicatorRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  metricValue: number;
  metricUnit: string;
  period: string;
  sourceDescription: string;
  privateEvidenceNotes?: string | null;
  status: IndicatorStatus;
  version: number;
  createdByUserId: string;
  approvedByUserId?: string | null;
  rejectionReason?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSubjectRequestRecord {
  id: string;
  donorId: string;
  requestType: 'ANONYMIZATION' | 'REVOKE_MARKETING' | 'ACCESS_REPORT';
  status: 'RECEIVED' | 'PROCESSED';
  notes?: string | null;
  createdAt: Date;
  processedAt?: Date | null;
}

/**
 * Thread-safe In-Memory Store / Data Access Layer for testing and fast standalone execution.
 * Guaranteed ACID-like single-process atomicity.
 */
export class DatabaseStore {
  donors = new Map<string, DonorRecord>();
  donationIntents = new Map<string, DonationIntentRecord>();
  pspCharges = new Map<string, PspChargeRecord>();
  pspEvents = new Map<string, PspEventRecord>();
  paymentTransactions = new Map<string, PaymentTransactionRecord>();
  financialEntries = new Map<string, FinancialEntryRecord>();
  reconciliationItems = new Map<string, ReconciliationItemRecord>();
  recurringSubscriptions = new Map<string, RecurringSubscriptionRecord>();
  users = new Map<string, UserRecord>();
  auditEvents: AuditEventRecord[] = [];
  donorOtps = new Map<string, DonorOtpRecord>();
  indicators = new Map<string, IndicatorRecord>();
  dataSubjectRequests = new Map<string, DataSubjectRequestRecord>();
  donorTimeline = new Map<string, DonorTimelineEventRecord[]>();

  constructor() {
    this.seedDefaultUsers();
    this.seedDefaultIndicators();
    this.seedCrmDonors();
  }

  private seedDefaultUsers() {
    // 0. Cláudia S. (Coordenação - Protótipo Acadêmico)
    const claudiaId = randomUUID();
    this.users.set('claudia@ebenezer.org.br', {
      id: claudiaId,
      email: 'claudia@ebenezer.org.br',
      passwordHash: 'coord123',
      role: 'ADMIN',
      mfaEnabled: true,
      mfaSecret: '123456',
      createdAt: new Date(),
    });

    // 1. Admin
    const adminId = randomUUID();
    this.users.set('admin@ebenezer.org.br', {
      id: adminId,
      email: 'admin@ebenezer.org.br',
      passwordHash: 'admin123',
      role: 'ADMIN',
      mfaEnabled: true,
      mfaSecret: '123456',
      createdAt: new Date(),
    });

    // 2. Financeiro
    const financeId = randomUUID();
    this.users.set('financeiro@ebenezer.org.br', {
      id: financeId,
      email: 'financeiro@ebenezer.org.br',
      passwordHash: 'fin123',
      role: 'FINANCE',
      mfaEnabled: true,
      mfaSecret: '123456',
      createdAt: new Date(),
    });

    // 3. Comunicação (Maker de indicadores)
    const commId = randomUUID();
    this.users.set('comunicacao@ebenezer.org.br', {
      id: commId,
      email: 'comunicacao@ebenezer.org.br',
      passwordHash: 'com123',
      role: 'COMMUNICATION',
      mfaEnabled: true,
      mfaSecret: '123456',
      createdAt: new Date(),
    });

    // 4. Aprovador / Direção (Checker de indicadores)
    const approverId = randomUUID();
    this.users.set('aprovador@ebenezer.org.br', {
      id: approverId,
      email: 'aprovador@ebenezer.org.br',
      passwordHash: 'apr123',
      role: 'APPROVER',
      mfaEnabled: true,
      mfaSecret: '123456',
      createdAt: new Date(),
    });

    // 5. Auditor Externo (Read-Only)
    const auditorId = randomUUID();
    this.users.set('auditor@ebenezer.org.br', {
      id: auditorId,
      email: 'auditor@ebenezer.org.br',
      passwordHash: 'aud123',
      role: 'AUDITOR_READONLY',
      mfaEnabled: true,
      mfaSecret: '123456',
      createdAt: new Date(),
    });
  }

  private seedDefaultIndicators() {
    const adminUser = this.users.get('admin@ebenezer.org.br');
    const approverUser = this.users.get('aprovador@ebenezer.org.br');
    const adminId = adminUser?.id || randomUUID();
    const approverId = approverUser?.id || randomUUID();

    const ind1Id = randomUUID();
    this.indicators.set(ind1Id, {
      id: ind1Id,
      code: 'IND-REFEICOES-2026',
      name: 'Refeições e Cestas Nutricionais Distribuídas',
      category: 'Segurança Alimentar',
      metricValue: 18450,
      metricUnit: 'refeições',
      period: 'Ano 2026 (Consolidado)',
      sourceDescription: 'Notas fiscais de compras de alimentos e livro de assinaturas dos beneficiários da cozinha comunitária.',
      privateEvidenceNotes: 'Pastas de notas fiscais digitalizadas e recibos com assinatura dos responsáveis (armazenamento seguro e sem exposição de dados pessoais).',
      status: 'PUBLISHED',
      version: 1,
      createdByUserId: adminId,
      approvedByUserId: approverId,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ind2Id = randomUUID();
    this.indicators.set(ind2Id, {
      id: ind2Id,
      code: 'IND-CRIANCAS-CONTRATURNO',
      name: 'Crianças e Jovens Atendidos no Contraturno Escolar',
      category: 'Educação & Cidadania',
      metricValue: 320,
      metricUnit: 'crianças/jovens',
      period: '3º Trimestre 2026',
      sourceDescription: 'Diário oficial de frequência do contraturno escolar e relatórios de oficinas pedagógicas.',
      privateEvidenceNotes: 'Fichas de matrícula e relatórios de frequência arquivados em cofre fechado com estrita conformidade com a LGPD.',
      status: 'PUBLISHED',
      version: 1,
      createdByUserId: adminId,
      approvedByUserId: approverId,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ind3Id = randomUUID();
    this.indicators.set(ind3Id, {
      id: ind3Id,
      code: 'IND-OFICINAS-REFORCO',
      name: 'Horas de Reforço Escolar e Oficinas Pedagógicas',
      category: 'Educação & Cidadania',
      metricValue: 1240,
      metricUnit: 'horas',
      period: '3º Trimestre 2026',
      sourceDescription: 'Folha de horas e registros dos professores voluntários e pedagogos.',
      privateEvidenceNotes: 'Planilhas de ponto assinadas pelos educadores e ementas pedagógicas das aulas de robótica e matemática.',
      status: 'PUBLISHED',
      version: 1,
      createdByUserId: adminId,
      approvedByUserId: approverId,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // --- Donors ---
  createDonor(data: Omit<DonorRecord, 'id' | 'createdAt' | 'updatedAt'>): DonorRecord {
    const existing = Array.from(this.donors.values()).find((d) => d.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      existing.fullName = data.fullName;
      if (data.taxIdCpf) existing.taxIdCpf = data.taxIdCpf;
      if (data.phone) existing.phone = data.phone;
      existing.marketingOptIn = data.marketingOptIn;
      existing.updatedAt = new Date();
      return existing;
    }
    const donor: DonorRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.donors.set(donor.id, donor);
    return donor;
  }

  findDonorById(id: string): DonorRecord | undefined {
    return this.donors.get(id);
  }

  findDonorByEmail(email: string): DonorRecord | undefined {
    return Array.from(this.donors.values()).find((d) => d.email.toLowerCase() === email.toLowerCase());
  }

  updateDonorMarketingOptIn(donorId: string, optIn: boolean): DonorRecord {
    const donor = this.donors.get(donorId);
    if (!donor) throw new Error(`Doador ${donorId} não encontrado`);
    donor.marketingOptIn = optIn;
    donor.updatedAt = new Date();
    return donor;
  }

  anonymizeDonor(donorId: string): DonorRecord {
    const donor = this.donors.get(donorId);
    if (!donor) throw new Error(`Doador ${donorId} não encontrado`);
    donor.fullName = 'Doador Anônimo (LGPD)';
    donor.email = `anonimizado-${donorId.substring(0, 8)}@anonimo.ebenezer.org.br`;
    donor.phone = null;
    donor.taxIdCpf = null;
    donor.marketingOptIn = false;
    donor.isAnonymized = true;
    donor.updatedAt = new Date();
    return donor;
  }

  // --- Donor OTPs (Magic Link / Login Sem Senha) ---
  createDonorOtp(donorId: string, email: string, otpCode: string, expiresAt: Date): DonorOtpRecord {
    const otp: DonorOtpRecord = {
      id: randomUUID(),
      donorId,
      email: email.toLowerCase(),
      otpCode,
      expiresAt,
      createdAt: new Date(),
    };
    this.donorOtps.set(otp.id, otp);
    return otp;
  }

  findValidOtp(email: string, otpCode: string): DonorOtpRecord | undefined {
    const now = new Date();
    return Array.from(this.donorOtps.values()).find(
      (o) =>
        o.email.toLowerCase() === email.toLowerCase() &&
        o.otpCode === otpCode &&
        !o.usedAt &&
        o.expiresAt > now
    );
  }

  markOtpUsed(id: string) {
    const otp = this.donorOtps.get(id);
    if (otp) {
      otp.usedAt = new Date();
    }
  }

  findDonationsByDonorId(donorId: string): Array<{
    intent: DonationIntentRecord;
    transaction?: PaymentTransactionRecord;
  }> {
    const intents = Array.from(this.donationIntents.values()).filter((i) => i.donorId === donorId);
    return intents.map((intent) => {
      const transaction = Array.from(this.paymentTransactions.values()).find(
        (t) => t.donationIntentId === intent.id
      );
      return { intent, transaction };
    });
  }

  findSubscriptionsByDonorId(donorId: string): RecurringSubscriptionRecord[] {
    return Array.from(this.recurringSubscriptions.values()).filter((s) => s.donorId === donorId);
  }

  // --- Donation Intents ---
  createDonationIntent(data: Omit<DonationIntentRecord, 'id' | 'createdAt' | 'updatedAt'>): DonationIntentRecord {
    const intent: DonationIntentRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.donationIntents.set(intent.id, intent);
    return intent;
  }

  findDonationIntentById(id: string): DonationIntentRecord | undefined {
    return this.donationIntents.get(id);
  }

  updateDonationIntentStatus(id: string, newStatus: DonationIntentStatus): DonationIntentRecord {
    const intent = this.donationIntents.get(id);
    if (!intent) throw new Error(`DonationIntent ${id} not found`);
    intent.status = newStatus;
    intent.updatedAt = new Date();
    return intent;
  }

  // --- PSP Charges ---
  createPspCharge(data: Omit<PspChargeRecord, 'id' | 'createdAt'>): PspChargeRecord {
    const charge: PspChargeRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.pspCharges.set(charge.id, charge);
    return charge;
  }

  findPspChargeByIntentId(intentId: string): PspChargeRecord | undefined {
    return Array.from(this.pspCharges.values()).find((c) => c.donationIntentId === intentId);
  }

  findPspChargeByExternalId(externalId: string): PspChargeRecord | undefined {
    return Array.from(this.pspCharges.values()).find((c) => c.externalChargeId === externalId);
  }

  // --- PSP Events (Webhook Ingestion) ---
  savePspEventIfNew(data: Omit<PspEventRecord, 'id' | 'receivedAt' | 'retryCount'>): { event: PspEventRecord; isNew: boolean } {
    const compositeKey = `${data.pspName}:${data.externalEventId}`;
    const existing = Array.from(this.pspEvents.values()).find(
      (e) => `${e.pspName}:${e.externalEventId}` === compositeKey
    );

    if (existing) {
      return { event: existing, isNew: false };
    }

    const event: PspEventRecord = {
      ...data,
      id: randomUUID(),
      retryCount: 0,
      receivedAt: new Date(),
    };
    this.pspEvents.set(event.id, event);
    return { event, isNew: true };
  }

  updatePspEventStatus(id: string, status: PspEventProcessingStatus) {
    const event = this.pspEvents.get(id);
    if (event) {
      event.processingStatus = status;
      event.processedAt = new Date();
    }
  }

  // --- Payment Transactions ---
  createPaymentTransaction(data: Omit<PaymentTransactionRecord, 'id' | 'createdAt'>): PaymentTransactionRecord {
    // Check uniqueness constraint: (psp_charge_id, external_transaction_id, transaction_type)
    const existing = Array.from(this.paymentTransactions.values()).find(
      (t) =>
        t.pspChargeId === data.pspChargeId &&
        t.externalTransactionId === data.externalTransactionId &&
        t.transactionType === data.transactionType
    );
    if (existing) {
      return existing;
    }

    const transaction: PaymentTransactionRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.paymentTransactions.set(transaction.id, transaction);

    // Auto-create Financial Entry (append-only)
    this.financialEntries.set(randomUUID(), {
      id: randomUUID(),
      paymentTransactionId: transaction.id,
      entryType: transaction.transactionType === 'REFUND' ? 'DEBIT' : 'CREDIT',
      amount: transaction.amountPaid,
      category: transaction.transactionType === 'REFUND' ? 'REFUND' : 'DONATION',
      entryDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    });

    return transaction;
  }

  // --- Reconciliation Items ---
  createReconciliationItem(data: Omit<ReconciliationItemRecord, 'id' | 'createdAt'>): ReconciliationItemRecord {
    const item: ReconciliationItemRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.reconciliationItems.set(item.id, item);
    return item;
  }

  resolveReconciliationItem(id: string, targetStatus: ReconciliationStatus, notes: string, userId: string): ReconciliationItemRecord {
    const item = this.reconciliationItems.get(id);
    if (!item) throw new Error(`ReconciliationItem ${id} not found`);
    item.status = targetStatus;
    item.resolutionNotes = notes;
    item.resolvedByUserId = userId;
    item.resolvedAt = new Date();
    return item;
  }

  // --- Audit Events ---
  recordAuditEvent(data: Omit<AuditEventRecord, 'id' | 'createdAt'>): AuditEventRecord {
    const audit: AuditEventRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.auditEvents.push(audit);
    return audit;
  }

  // --- Recurring Subscriptions ---
  createSubscription(data: Omit<RecurringSubscriptionRecord, 'id' | 'createdAt' | 'updatedAt'>): RecurringSubscriptionRecord {
    const subscription: RecurringSubscriptionRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.recurringSubscriptions.set(subscription.id, subscription);
    return subscription;
  }

  findSubscriptionById(id: string): RecurringSubscriptionRecord | undefined {
    return this.recurringSubscriptions.get(id);
  }

  cancelSubscription(id: string): RecurringSubscriptionRecord {
    const sub = this.recurringSubscriptions.get(id);
    if (!sub) throw new Error(`Assinatura recorrente ${id} não encontrada`);
    sub.status = 'CANCELLED';
    sub.updatedAt = new Date();
    return sub;
  }

  // --- Indicators & Cofre de Números (Maker-Checker) ---
  createIndicator(data: Omit<IndicatorRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>): IndicatorRecord {
    const indicator: IndicatorRecord = {
      ...data,
      id: randomUUID(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.indicators.set(indicator.id, indicator);
    return indicator;
  }

  findIndicatorById(id: string): IndicatorRecord | undefined {
    return this.indicators.get(id);
  }

  updateIndicator(id: string, updates: Partial<IndicatorRecord>): IndicatorRecord {
    const ind = this.indicators.get(id);
    if (!ind) throw new Error(`Indicador ${id} não encontrado`);
    Object.assign(ind, updates, { updatedAt: new Date() });
    return ind;
  }

  listIndicators(publicOnly: boolean = false): IndicatorRecord[] {
    const list = Array.from(this.indicators.values());
    if (publicOnly) {
      return list.filter((i) => i.status === 'PUBLISHED');
    }
    return list;
  }

  // --- Data Subject Requests (LGPD) ---
  createDataSubjectRequest(data: Omit<DataSubjectRequestRecord, 'id' | 'createdAt'>): DataSubjectRequestRecord {
    const req: DataSubjectRequestRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.dataSubjectRequests.set(req.id, req);
    return req;
  }

  // --- CRM & Doadores (Protótipo Ebenézer Recorrente) ---
  listCrmDonors() {
    return Array.from(this.donors.values()).map((donor) => {
      return {
        id: donor.id,
        name: donor.fullName,
        email: donor.email,
        phone: donor.phone || '—',
        originChannel: donor.originChannel || 'Site',
        lastDonationDate: donor.firstContactDate || '03/09/2026',
        totalDonated: donor.status === 'Recorrente' ? (donor.fullName === 'Roberto F.' ? 1200 : donor.fullName === 'Carlos A.' ? 500 : 300) : (donor.fullName === 'Regina M.' ? 180 : donor.fullName === 'Thiago R.' ? 250 : donor.fullName === 'Ana B.' ? 100 : donor.fullName === 'Mariana S.' ? 75 : donor.fullName === 'Pedro H.' ? 80 : 50),
        donationsCount: donor.status === 'Recorrente' ? (donor.fullName === 'Roberto F.' ? 12 : donor.fullName === 'Carlos A.' ? 5 : 6) : (donor.fullName === 'Regina M.' ? 3 : donor.fullName === 'Thiago R.' ? 4 : donor.fullName === 'Mariana S.' ? 2 : donor.fullName === 'Pedro H.' ? 2 : 1),
        status: donor.status || 'Pontual',
        recommendedAction: donor.recommendedAction || (donor.status === 'Recorrente' ? '—' : 'Convidar para mensal'),
      };
    });
  }

  getDonorDetail(donorId: string) {
    const donor = this.donors.get(donorId);
    if (!donor) throw new Error('Doador não encontrado');

    const timeline = this.donorTimeline.get(donorId) || [
      { id: randomUUID(), donorId: donor.id, date: '03/09/2026', title: 'Doação recebida · R$ 50,00 · Pix', type: 'DONATION', createdAt: new Date() },
      { id: randomUUID(), donorId: donor.id, date: '28/08/2026', title: 'Régua: e-mail de agradecimento enviado', type: 'COMMUNICATION', createdAt: new Date() },
      { id: randomUUID(), donorId: donor.id, date: '04/02/2026', title: 'Primeiro contato via ' + (donor.originChannel || 'Instagram'), type: 'CONTACT', createdAt: new Date() },
    ];

    const legalBasis = [
      {
        field: 'NOME',
        ground: 'Consentimento',
        controller: 'doador',
        retention: 'Enquanto houver consentimento',
      },
      {
        field: 'E-MAIL',
        ground: 'Consentimento',
        controller: 'doador',
        retention: 'Enquanto houver consentimento',
      },
      {
        field: 'VALOR DA DOAÇÃO',
        ground: 'Obrigação legal',
        controller: 'instituto',
        retention: '5 anos (fiscal)',
      },
      {
        field: 'DATA DA DOAÇÃO',
        ground: 'Obrigação legal',
        controller: 'instituto',
        retention: '5 anos (fiscal)',
      },
      {
        field: 'CANAL DE ORIGEM',
        ground: 'Legítimo interesse',
        controller: 'instituto',
        retention: '2 anos',
      },
    ];

    return {
      donor: {
        id: donor.id,
        name: donor.fullName,
        email: donor.email,
        phone: donor.phone || '(11) 98765-4321',
        originChannel: donor.originChannel || 'Instagram',
        firstContactDate: donor.firstContactDate || '04/02/2026',
        contactPreference: donor.contactPreference || 'E-mail',
        status: donor.status || 'Pontual',
        recommendedAction: donor.recommendedAction || 'Convidar para mensal',
      },
      timeline,
      legalBasis,
    };
  }

  getInviteEmailPreview(donorId: string) {
    const donor = this.donors.get(donorId);
    if (!donor) throw new Error('Doador não encontrado');
    return RecurringInviteEmailService.renderTemplate({
      donorId: donor.id,
      donorName: donor.fullName,
      donorEmail: donor.email,
      originChannel: donor.originChannel,
    });
  }

  inviteDonorToRecurring(donorId: string, ipAddress: string = '127.0.0.1') {
    const donor = this.donors.get(donorId);
    if (!donor) throw new Error('Doador não encontrado');

    // Despacho do E-mail Transacional com o Design System Oficial Ebenézer
    const emailDispatch = RecurringInviteEmailService.renderTemplate({
      donorId: donor.id,
      donorName: donor.fullName,
      donorEmail: donor.email,
      originChannel: donor.originChannel,
    });

    RecurringInviteEmailService.sendRecurringInvite({
      donorId: donor.id,
      donorName: donor.fullName,
      donorEmail: donor.email,
      originChannel: donor.originChannel,
    });

    const events = this.donorTimeline.get(donorId) || [];
    const newEvent: DonorTimelineEventRecord = {
      id: randomUUID(),
      donorId,
      date: new Date().toLocaleDateString('pt-BR'),
      title: 'Régua: convite para recorrência enviado (E-mail)',
      type: 'COMMUNICATION',
      createdAt: new Date(),
    };
    events.unshift(newEvent);
    this.donorTimeline.set(donorId, events);

    this.recordAuditEvent({
      userId: null,
      action: 'REGUA_INVITE_RECURRING_SENT',
      entityName: 'donors',
      entityId: donorId,
      changesDiff: {
        channel: donor.contactPreference || 'E-mail',
        emailRecipient: donor.email,
        subject: emailDispatch.subject,
      },
      ipAddress,
      userAgent: 'Backoffice',
    });

    return {
      success: true,
      message: `E-mail de convite mensal enviado para ${donor.email} com sucesso via Régua de Relacionamento!`,
      emailSentTo: donor.email,
      subject: emailDispatch.subject,
      previewHtml: emailDispatch.html,
    };
  }

  deleteDonorData(donorId: string, ipAddress: string = '127.0.0.1') {
    const donor = this.donors.get(donorId);
    if (!donor) throw new Error('Doador não encontrado');

    this.donors.delete(donorId);
    this.donorTimeline.delete(donorId);

    this.recordAuditEvent({
      userId: null,
      action: 'LGPD_DATA_SUBJECT_ERASURE',
      entityName: 'donors',
      entityId: donorId,
      changesDiff: { action: 'DELETED' },
      ipAddress,
      userAgent: 'Backoffice',
    });

    return { success: true, message: 'Dados do doador apagados com sucesso em conformidade com o Art. 18 da LGPD.' };
  }

  private seedCrmDonors() {
    const reginaId = 'regina-m-id';
    this.donors.set(reginaId, {
      id: reginaId,
      fullName: 'Regina M.',
      email: 'regina.exemplo@email.com',
      phone: '(11) 98765-4321',
      originChannel: 'Instagram',
      firstContactDate: '04/02/2026',
      contactPreference: 'E-mail',
      status: 'Pontual',
      recommendedAction: 'Convidar para mensal',
      marketingOptIn: true,
      createdAt: new Date('2026-02-04'),
      updatedAt: new Date(),
    });

    this.donorTimeline.set(reginaId, [
      { id: randomUUID(), donorId: reginaId, date: '03/09/2026', title: 'Doação recebida · R$ 50,00 · Pix', type: 'DONATION', createdAt: new Date() },
      { id: randomUUID(), donorId: reginaId, date: '28/08/2026', title: 'Régua: e-mail de agradecimento enviado', type: 'COMMUNICATION', createdAt: new Date() },
      { id: randomUUID(), donorId: reginaId, date: '12/06/2026', title: 'Doação recebida · R$ 30,00 · Pix', type: 'DONATION', createdAt: new Date() },
      { id: randomUUID(), donorId: reginaId, date: '10/06/2026', title: 'Régua: convite para recorrência enviado', type: 'COMMUNICATION', createdAt: new Date() },
      { id: randomUUID(), donorId: reginaId, date: '04/02/2026', title: 'Doação recebida · R$ 100,00 · Pix', type: 'DONATION', createdAt: new Date() },
      { id: randomUUID(), donorId: reginaId, date: '04/02/2026', title: 'Primeiro contato via Instagram', type: 'CONTACT', createdAt: new Date() },
    ]);

    const otherDonors = [
      { id: 'carlos-a-id', name: 'Carlos A.', email: 'carlos.a@email.com', channel: 'WhatsApp', lastDate: '28/08/2026', total: 500, count: 5, status: 'Recorrente', action: '—' },
      { id: 'fernanda-l-id', name: 'Fernanda L.', email: 'fernanda.l@email.com', channel: 'Site', lastDate: '15/08/2026', total: 50, count: 1, status: 'Pontual', action: 'Convidar para mensal' },
      { id: 'joao-p-id', name: 'João P.', email: 'joao.p@email.com', channel: 'Indicação', lastDate: '10/08/2026', total: 300, count: 6, status: 'Recorrente', action: '—' },
      { id: 'mariana-s-id', name: 'Mariana S.', email: 'mariana.s@email.com', channel: 'Instagram', lastDate: '02/08/2026', total: 75, count: 2, status: 'Pontual', action: 'Convidar para mensal' },
      { id: 'roberto-f-id', name: 'Roberto F.', email: 'roberto.f@email.com', channel: 'WhatsApp', lastDate: '20/07/2026', total: 1200, count: 12, status: 'Recorrente', action: '—' },
      { id: 'ana-b-id', name: 'Ana B.', email: 'ana.b@email.com', channel: 'Site', lastDate: '14/07/2026', total: 100, count: 1, status: 'Pontual', action: 'Convidar para mensal' },
      { id: 'thiago-r-id', name: 'Thiago R.', email: 'thiago.r@email.com', channel: 'Instagram', lastDate: '01/07/2026', total: 250, count: 4, status: 'Pontual', action: 'Convidar para mensal' },
      { id: 'luciana-d-id', name: 'Luciana D.', email: 'luciana.d@email.com', channel: 'Indicação', lastDate: '15/03/2026', total: 50, count: 1, status: 'Inativo', action: 'Convidar para mensal' },
      { id: 'pedro-h-id', name: 'Pedro H.', email: 'pedro.h@email.com', channel: 'WhatsApp', lastDate: '10/01/2026', total: 80, count: 2, status: 'Inativo', action: 'Convidar para mensal' },
    ];

    for (const d of otherDonors) {
      this.donors.set(d.id, {
        id: d.id,
        fullName: d.name,
        email: d.email,
        phone: '(11) 98765-0000',
        originChannel: d.channel,
        firstContactDate: d.lastDate,
        contactPreference: d.channel === 'WhatsApp' ? 'WhatsApp' : 'E-mail',
        status: d.status as any,
        recommendedAction: d.action,
        marketingOptIn: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // --- Helper to clear state between tests ---
  reset() {
    this.donors.clear();
    this.donorTimeline.clear();
    this.donationIntents.clear();
    this.pspCharges.clear();
    this.pspEvents.clear();
    this.paymentTransactions.clear();
    this.financialEntries.clear();
    this.reconciliationItems.clear();
    this.recurringSubscriptions.clear();
    this.auditEvents = [];
    this.donorOtps.clear();
    this.indicators.clear();
    this.dataSubjectRequests.clear();
    this.seedDefaultUsers();
    this.seedDefaultIndicators();
    this.seedCrmDonors();
  }
}

export const db = new DatabaseStore();

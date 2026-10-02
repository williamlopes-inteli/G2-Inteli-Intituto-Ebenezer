-- Schema DDL: Ebenézer Recorrente MVP 1
-- PostgreSQL 16+

-- 1. Donors (Doadores)
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    tax_id_cpf VARCHAR(14), -- Opcional (LGPD)
    marketing_opt_in BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donors_email ON donors(email);

-- 2. Donation Intents (Intenções de Doação)
CREATE TABLE IF NOT EXISTS donation_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id),
    campaign_id VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(30) DEFAULT 'CREATED' NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intents_status ON donation_intents(status);

-- 3. PSP Charges (Cobranças no Gateway)
CREATE TABLE IF NOT EXISTS psp_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_intent_id UUID NOT NULL UNIQUE REFERENCES donation_intents(id),
    psp_name VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    external_charge_id VARCHAR(100) NOT NULL,
    qr_code_url TEXT,
    copy_paste_code TEXT NOT NULL,
    charge_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    psp_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_charges_external_id ON psp_charges(external_charge_id);

-- 4. PSP Events (Armazenamento Durável de Webhooks)
CREATE TABLE IF NOT EXISTS psp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psp_name VARCHAR(50) NOT NULL,
    external_event_id VARCHAR(150) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    raw_payload JSONB NOT NULL,
    headers JSONB NOT NULL,
    processing_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    retry_count INTEGER DEFAULT 0 NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ,
    CONSTRAINT uq_psp_event UNIQUE (psp_name, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_psp_events_status ON psp_events(processing_status);

-- 5. Payment Transactions (Transações Financeiras Confirmadas)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_intent_id UUID NOT NULL REFERENCES donation_intents(id),
    psp_charge_id UUID NOT NULL REFERENCES psp_charges(id),
    external_transaction_id VARCHAR(150) NOT NULL,
    amount_paid NUMERIC(12,2) NOT NULL,
    fee_deducted NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    net_amount NUMERIC(12,2) NOT NULL,
    transaction_type VARCHAR(20) DEFAULT 'PAYMENT' NOT NULL, -- PAYMENT, REFUND
    parent_transaction_id UUID REFERENCES payment_transactions(id),
    paid_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_transaction_unique UNIQUE (psp_charge_id, external_transaction_id, transaction_type)
);

CREATE INDEX IF NOT EXISTS idx_transactions_intent ON payment_transactions(donation_intent_id);

-- 6. Financial Entries (Lançamentos Contábeis Imutáveis)
CREATE TABLE IF NOT EXISTS financial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id UUID NOT NULL UNIQUE REFERENCES payment_transactions(id),
    entry_type VARCHAR(10) NOT NULL, -- CREDIT, DEBIT
    amount NUMERIC(12,2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- DONATION, FEE, REFUND
    entry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Reconciliation Items (Conciliação e Caixa de Exceções)
CREATE TABLE IF NOT EXISTS reconciliation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id UUID REFERENCES payment_transactions(id),
    external_reference VARCHAR(150) NOT NULL,
    expected_amount NUMERIC(12,2) NOT NULL,
    actual_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'UNMATCHED' NOT NULL, -- UNMATCHED, MATCHED_PSP, SETTLED, DIVERGENT, UNDER_REVIEW
    discrepancy_reason TEXT,
    resolution_notes TEXT,
    resolved_by_user_id UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_items(status);

-- 8. Users & RBAC (Operadores do Back-office)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- ADMIN, FINANCE, COMMUNICATION, APPROVER, AUDITOR_READONLY
    mfa_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    mfa_secret VARCHAR(100),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Audit Events (Trilha Imutável de Auditoria)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(80) NOT NULL,
    entity_name VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    changes_diff JSONB,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);

-- 10. Donor OTPs (Acesso Seguro à Área do Doador com Expiração Curta)
CREATE TABLE IF NOT EXISTS donor_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donor_otps_email ON donor_otps(email);

-- 11. Indicators (Cofre de Números & Transparência Pública com Maker-Checker)
CREATE TABLE IF NOT EXISTS indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    metric_value NUMERIC(12,2) NOT NULL,
    metric_unit VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    source_description TEXT NOT NULL,
    private_evidence_notes TEXT, -- Evidências internas privadas protegidas
    status VARCHAR(30) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, REJECTED
    version INTEGER DEFAULT 1 NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    approved_by_user_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_indicators_status ON indicators(status);

-- 12. Data Subject Requests (Canal de Direitos dos Titulares - LGPD)
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id),
    request_type VARCHAR(50) NOT NULL, -- ANONYMIZATION, REVOKE_MARKETING, ACCESS_REPORT
    status VARCHAR(30) DEFAULT 'RECEIVED' NOT NULL, -- RECEIVED, PROCESSED
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ
);

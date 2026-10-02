# Quickstart Guide: Ebenézer Recorrente

**Feature Branch**: `001-ebenezer-recorrente`  
**Date**: 2026-10-01  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Este guia orienta a configuração do ambiente, execução de testes automatizados e simulação ponta a ponta do fluxo de doações via Pix com conciliação financeira do Instituto Ebenézer.

---

## 1. Pré-requisitos

- **Node.js**: v20+ LTS
- **npm** ou **pnpm**
- **Docker** ou PostgreSQL 16+ local (para testes de integração com banco relacional)
- **Git**

---

## 2. Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto ou diretório da aplicação:

```env
# Servidor & Ambiente
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ebenezer_db

# PSP / Gateway (mock | asaas | efi)
PSP_ACTIVE_GATEWAY=mock
PSP_MOCK_AUTO_CONFIRM=false

# Chaves para PSPs reais (sandbox/homologação)
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
EFI_CLIENT_ID=
EFI_CLIENT_SECRET=
EFI_CERTIFICATE_PATH=

# Notificações / E-mail Transacional
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=doacoes@ebenezer.org.br

# Segurança do Back-office
JWT_SECRET=super_secret_jwt_key_ebenezer_dev_change_in_prod
```

---

## 3. Instalação e Inicialização

```bash
# Instalar dependências
npm install

# Executar migrações do banco de dados
npm run db:migrate

# Executar o simulador / servidor em modo desenvolvimento
npm run dev
```

---

## 4. Execução dos Testes Obrigatórios

Conforme a Constituição do Projeto (Princípio III), a suíte de testes cobre a máquina de estados financeiros e a Matriz de Exceções:

```bash
# Executar todos os testes de unidade e máquina de estados
npm test

# Executar testes da Matriz de Exceções Financeiras (Idempotência, Tardio, Divergente)
npm run test:financial-matrix

# Executar testes de contrato de API
npm run test:contracts
```

---

## 5. Simulação do Fluxo Ponta a Ponta com o Mock PSP

O simulador nativo permite reproduzir cenários de pagamento reais sem credenciais de produção:

1. **Criar intenção e gerar cobrança Pix**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/donations/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "campaignId": "acolhimento-infantil",
       "amount": 50.00,
       "donorName": "Doador Exemplo",
       "donorEmail": "doador@exemplo.com",
       "marketingOptIn": false
     }'
   ```
   *Retorna*: `intentId`, `copyPasteCode`, `expiresAt`.

2. **Simular pagamento pontual confirmado via Webhook**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/webhooks/psp/mock \
     -H "Content-Type: application/json" \
     -d '{
       "eventType": "PAYMENT_CONFIRMED",
       "eventId": "evt_teste_001",
       "chargeId": "<chargeId_retornado>",
       "amountPaid": 50.00,
       "paidAt": "2026-10-01T22:00:00Z"
     }'
   ```

3. **Verificar consulta de status (Polling pelo Frontend)**:
   ```bash
   curl http://localhost:3000/api/v1/donations/<intentId>/status
   ```
   *Retorna*: `{"status": "PAID", "receiptSent": true}`.

4. **Simular pagamento tardio (Intenção Expirada)**:
   - Emita uma notificação com `paidAt` posterior ao horário de expiração da intenção.
   - O sistema classifica o registro como `LATE_PAYMENT_REVIEW` e envia para a Caixa de Exceções no painel do financeiro.

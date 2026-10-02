# Implementation Plan: Ebenézer Recorrente (MVP 1)

**Branch**: `001-ebenezer-recorrente` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-ebenezer-recorrente/spec.md` e PRD v1.1.

## Summary

Implementação do MVP 1 da plataforma de doações e conciliação do Instituto Ebenézer. A solução é arquitetada como um monólito modular em TypeScript (Node.js/Fastify) com PostgreSQL e frontend React responsivo (Tailwind CSS). O núcleo financeiro utiliza o padrão de Adaptador de PSP com suporte inicial a Asaas/Efí e um simulador nativo de sandbox determinístico para testes e homologação sem dependência externa. O sistema implementa persistência durável prévia de webhooks (`PspEvent`), idempotência estrita, segregação absoluta de estados contábeis (intenções, cobranças, transações, lançamentos e conciliação) e tratamento completo da Matriz de Exceções Financeiras (pagamentos tardios, divergentes, órfãos e estornos), com painel de back-office protegido por RBAC e MFA e estrita conformidade com a LGPD.

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node.js 20+ LTS  
**Primary Dependencies**:
- Backend: Fastify (HTTP server rápido e schema-first), Zod (validação e tipagem de entrada/saída), Drizzle ORM ou Prisma (interação SQL type-safe), Jose / Bcrypt (segurança JWT e hashing de senhas), Nodemailer / Resend (e-mails transacionais).
- Frontend: React 18+, Vite, Tailwind CSS, Lucide React (ícones), QRCode.react (renderização visual de QR code).
**Storage**: PostgreSQL 16+ com suporte a transações ACID e consultas estruturadas com locking (`SELECT FOR UPDATE`).  
**Testing**: Vitest / Supertest para testes unitários, testes de integração de contratos de API e testes automatizados da Matriz de Exceções Financeiras.  
**Target Platform**: Linux container (Docker) em ambiente Cloud/VPS compatível com Node.js e PostgreSQL.  
**Project Type**: Web Application monólito modular (backend REST API + worker em segundo plano + frontend SPA/SSR).  
**Performance Goals**:
- Resposta de ingestão de webhook < 500 ms (gravação durável imediata).
- Confirmação do pagamento refletida no polling do doador em < 3 segundos após emissão do webhook.
- Suporte a 100 requisições simultâneas em regime normal e picos de campanha até 1.000 requisições/min.  
**Constraints**:
- Não inventar endpoints ou contratos de PSP: utilizar adaptador desacoplado com mock completo.
- Respeitar estritamente a LGPD: CPF opcional (minimização), opt-in de marketing desmarcado por padrão e isolamento total de evidências com dados de crianças/beneficiários.
- Imutabilidade financeira: lançamentos originais nunca são apagados ou editados; estornos são registros compensatórios vinculados.  
**Scale/Scope**: MVP 1 com suporte a doação pontual via Pix dinâmico, caixa de exceções e conciliação financeira assistida. Fases 2 (Pix Automático) e 3 (Cofre) bloqueadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Princípio I (Rigor Financeiro & Segregação de Estados)**: Entidades `DonationIntent`, `PspCharge`, `PspEvent`, `PaymentTransaction`, `FinancialEntry` e `ReconciliationItem` modeladas separadamente em `data-model.md`. Lançamentos são append-only e transições de estado são unidirecionais.
- [x] **Princípio II (Integridade de Integração PSP & Idempotência)**: Contrato do webhook prevê gravação durável prévia antes do HTTP 200. Chave de idempotência obrigatória nas cobranças. Mock PSP nativo para testes sem chaves falsas.
- [x] **Princípio III (Test-First & Matriz de Exceções Obrigatória)**: Todos os 8 cenários da matriz de exceções financeira contemplados no design, rotas e data model (`research.md`).
- [x] **Princípio IV (Privacy by Design & Proteção de Crianças)**: CPF definido como opcional; consentimento de marketing desacoplado e desmarcado por padrão; evidências institucionais privadas por padrão.
- [x] **Princípio V (Escopo Incremental & Portas de Aprovação)**: Foco total no MVP 1; Pix Automático (Fase 2) e Cofre (Fase 3) mantidos fora do escopo ativo de entrega.

## Project Structure

### Documentation (this feature)

```text
specs/001-ebenezer-recorrente/
├── spec.md              # Feature specification com critérios de aceite
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais, stack e matriz de exceções
├── data-model.md        # Modelo ER, esquemas de tabelas e estados
├── quickstart.md        # Guia de configuração, execução e testes locais
├── checklists/
│   └── requirements.md  # Checklist de qualidade validado
└── contracts/
    ├── donations-api.yaml      # OpenAPI do checkout público de doações
    ├── psp-webhook-api.yaml    # OpenAPI da ingestão de webhooks do PSP
    └── backoffice-api.yaml     # OpenAPI do back-office e conciliação
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/              # Variáveis de ambiente, constantes e configuração
│   ├── domain/              # Regras de negócio e máquinas de estado puro
│   │   ├── entities/        # DonationIntent, PaymentTransaction, etc.
│   │   └── state-machine/   # Validação de transições financeiras imutáveis
│   ├── modules/
│   │   ├── donations/       # Casos de uso de doação, checkout e consulta
│   │   ├── psp/             # Adaptadores de PSP (Mock, Asaas, Efí) e Webhooks
│   │   ├── reconciliation/  # Motor de conciliação e Caixa de Exceções
│   │   ├── backoffice/      # Autenticação de operadores, RBAC e auditoria
│   │   └── notifications/   # Envio idempotente de comprovantes por e-mail
│   ├── infra/
│   │   ├── database/        # Migrações, conexão e repositórios
│   │   └── http/            # Servidor Fastify, rotas e middlewares
│   └── index.ts             # Ponto de entrada do backend
└── tests/
    ├── unit/                # Testes de unidade da máquina de estados
    ├── financial-matrix/    # Testes obrigatórios da matriz de exceções
    └── integration/         # Testes de integração de checkout e webhook

frontend/
├── src/
│   ├── components/          # Componentes visuais acessíveis (Navbar, Footer, etc.)
│   ├── modules/
│   │   ├── checkout/        # Tela de doação, seleção de valor, QR Code e status
│   │   └── backoffice/      # Telas de dashboard, exceções e conciliação
│   ├── services/            # Clientes HTTP para API de doações e backoffice
│   └── App.tsx              # Roteamento e ponto de entrada da aplicação
└── index.html               # Template HTML responsivo mobile-first
```

**Structure Decision**: Monólito modular com diretórios `backend/` e `frontend/` separados na raiz do repositório, garantindo independência de build e testes, ao mesmo tempo em que compartilham contratos tipados e simplicidade de manutenção para a equipe do Instituto Ebenézer.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Adaptador de PSP desacoplado com Mock nativo | Permite testar todos os fluxos e exceções financeiras localmente sem depender de aprovação bancária imediata | Acoplamento direto ao PSP impediria testes determinísticos de exceções e violaria a Constituição |
| Outbox Pattern / Persistência durável prévia de webhook | Impede perda de notificações do PSP em caso de oscilação momentânea do servidor | Processamento síncrono no handler HTTP pode causar timeout no PSP e perda de liquidação |

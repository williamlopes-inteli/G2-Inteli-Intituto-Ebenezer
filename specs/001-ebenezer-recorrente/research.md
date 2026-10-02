# Research & Architecture Decisions: Ebenézer Recorrente

**Feature Branch**: `001-ebenezer-recorrente`  
**Date**: 2026-10-01  
**Spec**: [spec.md](./spec.md)

## 1. Technical Decisions & Justifications

### 1.1 Stack Tecnológica (DECISÃO-04)
- **Backend**: Node.js com TypeScript e Fastify (ou Express).
  - *Racional*: Tipagem estática end-to-end, alto throughput para endpoints de webhook, ecossistema maduro com excelentes bibliotecas para validação de esquemas (Zod), criptografia e integração bancária.
- **Banco de Dados**: PostgreSQL 16+.
  - *Racional*: Suporte a transações ACID rigorosas (nível `Read Committed` / `Serializable` para operações financeiras), tabelas particionadas ou índices parciais para auditoria, e suporte a `SELECT FOR UPDATE` para evitar condições de corrida em conciliação concorrente.
- **ORM / Query Builder**: Prisma ou Drizzle ORM.
  - *Racional*: Migrações versionadas determinísticas, tipagem segura nas consultas e suporte a transações ACID seguras.
- **Frontend**: React com TypeScript, Vite e Tailwind CSS.
  - *Racional*: Componentização acessível (WCAG 2.1 AA), responsividade mobile-first, bundles ultraleves e facilidade de deploy em CDN/servidor estático.
- **Mensageria / Fila**: Outbox Pattern transacional no PostgreSQL + Worker em segundo plano (com suporte a evolução para Redis/BullMQ se o volume escalar além de 5.000 requisições simultâneas).
  - *Racional*: Garante que a escrita do webhook recebido e o agendamento de processamento ocorram na mesma transação atômica do banco, eliminando a janela de perda de eventos.

### 1.2 Arquitetura do Adaptador de PSP e Sandbox Nativo (DECISÃO-02)
- **Padrão de Design**: Adapter Pattern (`PspGatewayAdapter` interface).
- **Contrato do Adaptador**:
  - `createDynamicCharge(intent: DonationIntent): Promise<PspChargeResult>`
  - `verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean`
  - `parseWebhookPayload(rawBody: string): NormalizedPspEvent`
  - `getChargeStatus(pspChargeId: string): Promise<PspChargeStatusResult>`
  - `requestRefund(transactionId: string, amount: number, reason: string): Promise<RefundResult>`
- **Implementações**:
  - `MockPspAdapter`: Simulador nativo e determinístico para testes e desenvolvimento local sem necessidade de credenciais de produção ou internet. Permite disparar simulações de pagamentos imediatos, pagamentos tardios, pagamentos divergentes e duplicidade de webhooks.
  - `AsaasPspAdapter`: Adaptador oficial para API do Asaas (muito utilizado em ONGs brasileiras), com autenticação via `access_token` e validação de webhook via token secreto no header `asaas-access-token`.
  - `EfiPspAdapter`: Adaptador oficial para a API Pix da Efí (antiga Gerencianet), compatível com o padrão Bacen e webhooks autenticados.

### 1.3 Segregação Estrita de Estados Financeiros (Princípio I da Constituição)
As entidades financeiras não compartilham tabelas nem sofrem mutações destrutivas:
1. `DonationIntent`: `CREATED` → `AWAITING_PAYMENT` → `PAID` | `EXPIRED` | `CANCELLED` | `LATE_PAYMENT_REVIEW`.
2. `PspCharge`: Cobrança gerada com `txid`, QR Code, payload e expiração real do PSP.
3. `PspEvent`: Evento bruto gravado com `idempotency_key`, timestamp e cabeçalhos. Nunca é alterado após gravação.
4. `PaymentTransaction`: Registro imutável do fato financeiro identificado por `(psp_id, external_transaction_id)`. Estornos geram novas transações de tipo `REFUND` vinculadas à original.
5. `FinancialEntry`: Lançamento contábil de débito/crédito.
6. `ReconciliationItem`: `UNMATCHED` | `MATCHED_PSP` | `SETTLED` | `DIVERGENT` | `UNDER_REVIEW`.

### 1.4 Matriz de Exceções Financeiras (Princípio III da Constituição)

| Cenário de Exceção | Detecção Técnica | Ação do Sistema | Resultado Contábil |
|---|---|---|---|
| Webhook duplicado | `PspEvent.event_id` já existente no banco | Retorna HTTP 200/204 imediatamente; não enfileira novo processamento de negócio | Nenhuma duplicação de transação ou envio de e-mail |
| Webhook adulterado / assinatura inválida | Falha na validação do cabeçalho de assinatura/token | Rejeita imediatamente com HTTP 401; registra alerta de segurança com IP sem dados sensíveis | Nenhuma escrita financeira |
| Intenção expirada com pagamento recebido | Timestamp de liquidação > `DonationIntent.expires_at` | Registra `PaymentTransaction`, atualiza intenção para `LATE_PAYMENT_REVIEW` e envia para Caixa de Exceções | Dinheiro acolhido com revisão contábil |
| Valor pago divergente do solicitado | `event.amount != DonationIntent.amount` | Registra `PaymentTransaction`, vincula à intenção e marca `ReconciliationItem` como `DIVERGENT` | Retido em quarentena para contato ou ajuste |
| Pix direto na chave do Instituto (órfão) | Evento em extrato sem correlação com `txid` conhecido | Registra item de conciliação como `UNMATCHED` para triagem manual | Requer identificação manual e justificativa |
| Webhook perdido ou worker temporariamente offline | Varredura de outbox / rotina de reconciliação de cobranças ativas | Rotina de background consulta status das cobranças em aberto na API do PSP | Intenção confirmada por polling ativo |
| Devolução / Estorno | Evento de `REFUND` recebido do PSP | Cria `PaymentTransaction` do tipo `REFUND` apontando para a transação original; atualiza balanço líquido | Histórico original preservado; saldo ajustado |

### 1.5 Privacidade, LGPD e Proteção de Crianças (Princípio IV da Constituição)
- CPF é opcional no checkout; coletado exclusivamente se o doador solicitar recibo nominal.
- Checkbox de marketing opcional e desmarcado por padrão (sem opt-out camuflado ou pré-seleção).
- Dados de beneficiários (crianças, adolescentes e famílias atendidas pelo Instituto): absolutamente nenhuma foto, nome real ou identificador pessoal é exposto em APIs públicas. Todas as evidências ficam em armazenamento privado com controle estrito de RBAC.
- Mascaramento de dados nos logs da aplicação (`log.info` com sanitização automática de CPF, chaves e tokens).

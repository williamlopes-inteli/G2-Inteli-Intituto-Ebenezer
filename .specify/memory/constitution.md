# Ebenézer Recorrente Constitution

## Core Principles

### I. Rigor Financeiro e Segregação de Estados (NON-NEGOTIABLE)
- Intenções (`DonationIntent`), cobranças emitidas (`PspCharge`), eventos recebidos (`PspEvent`), transações confirmadas (`PaymentTransaction`), lançamentos contábeis (`FinancialEntry`) e conciliação (`ReconciliationItem`) são entidades e estados estritamente separados.
- Pagamento confirmado pelo PSP **não implica** liquidação financeira ou conciliação em extrato bancário.
- Nunca sobrescrever ou editar lançamentos financeiros originais; estornos e devoluções exigem lançamentos compensatórios vinculados.
- Transições de estado são unidirecionais e imutáveis: nunca realizar downgrade de `PAID` para `EXPIRED` por evento atrasado; pagamentos recebidos após expiração exigem fluxo de revisão (`LATE_PAYMENT_REVIEW`), sem descarte de recursos.

### II. Integridade de Integração PSP e Idempotência Real
- Não inventar endpoints, assinaturas, campos ou comportamento do PSP; todos os contratos devem ser derivados da documentação oficial do PSP homologado.
- Nunca produzir payload ou QR Code Pix dinâmico localmente sem validação e emissão prévia pelo PSP parceiro.
- Toda emissão de cobrança ao PSP deve conter chave de idempotência durável.
- Endpoints de webhook devem validar autenticidade (assinatura/HMAC/mTLS/token) e persistir o payload bruto de forma durável antes de retornar confirmação HTTP 2xx ao PSP. O processamento de negócio deve ser enfileirado e idempotente.

### III. Test-First e Matriz de Exceções Financeiras (NON-NEGOTIABLE)
- TDD obrigatório para a máquina de estados financeiros e fluxos de webhook e conciliação: testes escritos, falhas observadas, implementação e refatoração.
- A Matriz de Exceções Financeiras deve ter cobertura automatizada de testes obrigatória antes de qualquer liberação:
  1. Webhook duplicado (idempotência sem duplicar transação ou receita);
  2. Webhook inválido ou adulterado (rejeição segura e log sem segredos);
  3. Pagamento sem intenção / Pix órfão (quarentena para triagem manual);
  4. Intenção expirada com pagamento recebido (revisão sem perda contábil);
  5. Valor ou identificador divergente (quarentena de divergência);
  6. Webhook perdido ou eventos fora de ordem (reprocessamento durável e polling no PSP);
  7. Devoluções e estornos (lançamentos compensatórios líquidos);
  8. Indisponibilidade transitória do PSP (contingência e retentativas exponenciais com jitter).
- Testes devem utilizar exclusivamente sandbox oficial e simulações; proibido utilizar segredos, tokens ou dados pessoais reais em suítes de teste.

### IV. Privacy by Design e Proteção de Dados (LGPD)
- Coleta estritamente mínima de dados: CPF coletado somente se exigido pelo PSP para liquidação ou comprovante formal.
- Separação clara e obrigatória entre comunicação transacional necessária (comprovante/agradecimento) e comunicação de marketing (opt-in explícito, opcional, nunca pré-selecionado).
- Proteção integral a beneficiários vulneráveis: fotos, nomes e dados de crianças ou famílias atendidas pelo Instituto jamais podem ser expostos publicamente ou em logs; evidências de impacto permanecem privadas por padrão.
- Credenciais bancárias ou segredos nunca são armazenados na aplicação; senhas, chaves e tokens de PSP devem residir em gerenciador seguro de variáveis de ambiente.
- Mascaramento de identificadores sensíveis em logs estruturados e auditoria mandatória em todas as consultas ou exportações de dados no back-office.

### V. Escopo Incremental e Portas de Aprovação
- Foco absoluto na entrega do MVP 1 (Doação pontual via Pix dinâmico, webhook seguro, back-office básico e conciliação).
- Funcionalidades da Fase 2 (Pix Automático, área autenticada do doador, opt-out de marketing) e Fase 3 (Cofre de Números e evidências) permanecem bloqueadas para código produtivo até aprovação formal das decisões `[DECISÃO-01]` a `[DECISÃO-07]`.
- Governança de publicação de indicadores e dados públicos com modelo Maker-Checker: o criador da métrica nunca pode ser o seu próprio aprovador.
- Proibição absoluta de publicar em produção, acionar doadores reais ou conectar contas bancárias reais sem aprovação formal e expressa dos responsáveis do Instituto Ebenézer.

## Security & Architecture Constraints
- Arquitetura baseada em monólito modular com separação clara de responsabilidades (Checkout/Doador, Core de Pagamentos/PSP, Back-office/Conciliação, Auditoria).
- Backend stateless com persistência relacional (PostgreSQL) e suporte a transações ACID para consistência financeira.
- Mecanismo de fila e outbox transacional para desacoplamento seguro entre recebimento de webhooks, atualização financeira e notificações transacionais.
- Back-office protegido com controle de acesso baseado em funções (RBAC: `ADMIN`, `FINANCE`, `COMMUNICATION`, `APPROVER`, `AUDITOR_READONLY`) e suporte obrigatório a MFA.

## Development Workflow & Quality Gates
- Cada incremento deve documentar explicitamente: o que está implementado, o que foi simulado/mockado, o que depende de homologação externa do PSP e o que está bloqueado.
- Gates de qualidade: linter, testes de unidade, testes de integração de contratos com o PSP (sandbox) e checklist de segurança OWASP ASVS aplicável antes de qualquer release.

## Governance
- Esta Constituição é o documento supremo de diretrizes técnicas e operacionais para a plataforma Ebenézer Recorrente.
- Nenhuma funcionalidade financeira pode ser aceita sem comprovação de testes para as exceções da seção III.
- Modificações nesta Constituição exigem registro versionado e consentimento da liderança do projeto.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01

# Feature Specification: Plataforma Ebenézer Recorrente

**Feature Branch**: `001-ebenezer-recorrente`  
**Created**: 2026-10-01  
**Status**: Draft  
**Input**: PRD — Ebenézer Recorrente v1.1 (Plataforma de doações pontuais e recorrentes via Pix com conciliação financeira e prestação de contas do Instituto Ebenézer)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Doação Pontual via Pix com Confirmação Imediata (Priority: P1)

Como um doador individual que apoia as ações do Instituto Ebenézer, quero acessar uma página responsiva e clara, escolher uma campanha e um valor de contribuição, gerar um Pix dinâmico seguro e receber a confirmação e comprovante logo após o pagamento, para que eu possa contribuir com facilidade e ter certeza de que minha doação foi recebida pelo Instituto.

**Why this priority**: É o cerne do MVP 1 e a principal via de captação digital de recursos para manter as atividades assistenciais do Instituto. Sem a captura e confirmação confiável de Pix pontual, o produto não tem valor funcional mínimo.

**Independent Test**: Um doador acessa a página pública de doação em dispositivo móvel ou desktop, seleciona uma campanha e valor pré-definido (ou digita valor livre), preenche seus dados mínimos de contato, visualiza o QR Code e código Copia e Cola dinâmicos gerados pelo provedor integrado (com prazo de expiração visível). Ao pagar no aplicativo bancário, a tela do doador atualiza automaticamente informando o sucesso da transação e um comprovante transacional é enviado para o e-mail informado.

**Acceptance Scenarios**:

1. **Given** um doador na página de doação, **When** seleciona a campanha "Acolhimento Infantil", escolhe o valor de R$ 50,00, informa nome e e-mail e clica em "Contribuir via Pix", **Then** o sistema gera uma intenção de doação única, solicita a cobrança dinâmica ao parceiro financeiro e exibe o QR Code, a linha digitável Copia e Cola e a data/hora exata de expiração.
2. **Given** um QR Code Pix gerado e apresentado em tela com status aguardando pagamento, **When** o doador efetua o pagamento no banco e a confirmação é recebida pelo sistema, **Then** a interface do doador atualiza seu status para "Doação confirmada com sucesso!" e um e-mail com comprovante transacional de agradecimento é despachado uma única vez.
3. **Given** uma cobrança Pix aberta na tela do doador, **When** o tempo limite de validade expira sem detecção de pagamento, **Then** a interface altera o estado para "Cobrança expirada", desabilita o código Copia e Cola e oferece botão para gerar uma nova contribuição.
4. **Given** o formulário de doação aberto, **When** o doador preenche os dados, **Then** a caixa de consentimento para recebimento de comunicações institucionais/marketing é apresentada como opcional e desmarcada por padrão, separada do consentimento para recebimento do comprovante transacional.

---

### User Story 2 - Processamento Seguro, Durável e Idempotente de Notificações de Pagamento (Priority: P1)

Como a equipe de tecnologia e finanças do Instituto, quero que todas as notificações de pagamento enviadas pelo parceiro financeiro (PSP) sejam validadas criptograficamente, registradas de forma imutável e durável antes da confirmação HTTP ao parceiro, e processadas de modo estritamente idempotente por fila, para que nenhum evento financeiro seja perdido, nenhuma doação seja computada em duplicidade e o histórico permaneça íntegro.

**Why this priority**: É a garantia de consistência patrimonial e financeira da instituição. Evita relatórios inflados por mensagens duplicadas de webhook, fraudes de dados adulterados e inconsistências em caso de oscilação momentânea de rede.

**Independent Test**: Enviar requisições de webhook simulando: notificação legítima de confirmação, reenvio da mesma notificação (duplicata de rede), notificação com assinatura digital inválida e notificação referente a pagamento efetuado após a expiração da intenção. Verificar que a transação legítima é confirmada uma única vez, duplicatas não geram novas transações, assinaturas inválidas são rejeitadas com código apropriado e pagamentos tardios são encaminhados para a Caixa de Exceções.

**Acceptance Scenarios**:

1. **Given** uma notificação válida de liquidação de Pix enviada pelo provedor parceiro, **When** o endpoint de webhook recebe a requisição, **Then** o sistema valida a autenticidade e assinatura da mensagem, armazena o evento bruto em tabela durável e retorna código de sucesso HTTP 2xx ao provedor antes de iniciar o processamento em fila.
2. **Given** um evento de webhook já persistido e processado, **When** o provedor reenvia a mesma notificação por retentativa automática, **Then** o sistema reconhece a duplicidade pela chave única do evento, responde HTTP 2xx ao parceiro e não altera saldos, não duplica transações e não reenvia e-mail ao doador.
3. **Given** uma requisição de webhook contendo assinatura digital inválida ou cabeçalhos adulterados, **When** atinge o endpoint, **Then** a requisição é imediatamente rejeitada com erro 401/403, registrando metadados mínimos de segurança sem vazar segredos ou dados pessoais em logs.
4. **Given** uma intenção de doação que expirou às 15:00, **When** às 15:10 chega um pagamento válido correspondente a essa intenção, **Then** o sistema não descarta o dinheiro recebido, registra o evento financeiro e classifica a intenção como `LATE_PAYMENT_REVIEW`, encaminhando o caso para tratamento da equipe financeira.

---

### User Story 3 - Painel Financeiro, Caixa de Exceções e Conciliação Contábil (Priority: P2)

Como membro da equipe financeira do Instituto Ebenézer, quero acessar um back-office seguro com autenticação de duplo fator, consultar doações em tempo real com segregação precisa de estados (pretendidas, confirmadas pelo PSP e liquidadas em conta), visualizar a Caixa de Exceções e conciliar recebimentos com relatórios do PSP e extratos bancários, para que o fechamento financeiro mensal seja transparente, rápido e auditável.

**Why this priority**: Substitui o controle manual em planilhas sujeitas a erros humanos e proporciona visão transparente da saúde financeira da organização, distinguindo promessas/intenções de receitas de fato disponíveis para os projetos sociais.

**Independent Test**: Usuário com papel `FINANCE` autentica-se com duplo fator (MFA), visualiza os totais segregados do mês, acessa a lista de exceções, seleciona um pagamento tardio pendente de revisão (`LATE_PAYMENT_REVIEW`), associa a destinação contábil com justificativa formal e efetua a conciliação com o extrato bancário, gerando trilha de auditoria completa.

**Acceptance Scenarios**:

1. **Given** um operador financeiro autenticado no back-office, **When** acessa o painel de fechamento do período, **Then** o sistema apresenta dashboards com métricas segregadas: volume de intenções geradas, total de pagamentos confirmados pelo provedor, total de repasses efetivamente liquidados e total de divergências sob análise.
2. **Given** itens pendentes na Caixa de Exceções (como valores divergentes ou pagamentos tardios), **When** o operador seleciona um item e realiza a triagem manual informando a justificativa, **Then** o sistema atualiza o status do item de conciliação para `SETTLED` ou `UNDER_REVIEW` e registra permanentemente o ID do operador, data, hora e justificativa na trilha de auditoria.
3. **Given** um operador financeiro solicitando exportação de relatório para conferência contábil, **When** confirma a exportação, **Then** os dados pessoais de doadores são mascarados nos campos não essenciais e o evento de exportação é registrado no log de auditoria com o IP e identidade do solicitante.
4. **Given** um usuário com perfil restrito (ex: `COMMUNICATION` ou `AUDITOR_READONLY`), **When** tenta acessar ações de conciliação financeira ou edição de registros, **Then** o acesso às mutações é bloqueado pelo controle de acesso em nível de servidor.

---

### User Story 4 - Doação Recorrente via Pix Automático e Gestão pelo Doador (Priority: P3 - Fase 2 / Bloqueada por DECISÃO-06)

Como um doador recorrente que deseja apoiar continuamente o Instituto Ebenézer, quero autorizar uma cobrança mensal automática de Pix diretamente no aplicativo do meu banco e ter acesso a uma área simples e segura para acompanhar meu histórico e cancelar a autorização quando desejar, para manter minha contribuição regular sem fricção de ter que gerar cobranças avulsas todo mês.

**Why this priority**: Aumenta a previsibilidade orçamentária do Instituto e diminui o custo de re-captação, porém depende da homologação regulatória e técnica do Pix Automático junto ao provedor selecionado.

**Independent Test**: Após desbloqueio da Fase 2, doador seleciona opção recorrente mensal, é direcionado ao fluxo de consentimento do banco, autoriza a jornada e tem a recorrência ativada com cobrança periódica agendada.

**Acceptance Scenarios**:

1. **Given** o doador selecionando modalidade recorrente, **When** conclui o fluxo de autorização no parceiro homologado, **Then** o sistema registra a autorização com status `ACTIVE` associada ao cadastro do doador e agenda o ciclo mensal de cobrança.
2. **Given** um doador recorrente solicitando acesso à sua área pessoal, **When** informa seu e-mail cadastrado, **Then** o sistema envia um link mágico de uso único e expiração curta (sem exigir criação de senha permanente), permitindo visualizar o histórico e solicitar cancelamento da recorrência a qualquer momento.

---

### User Story 5 - Transparência Pública com Governança Maker-Checker (Priority: P3 - Fases 2 e 3 / Bloqueada por DECISÃO-07)

Como um doador ou cidadão interessado no impacto social do Instituto, quero acessar uma página pública de transparência para consultar indicadores consolidados e verificados das atividades institucionais (como número de refeições servidas ou famílias atendidas), tendo a certeza de que cada dado foi revisado e aprovado pela diretoria e que nenhuma imagem ou dado sensível de crianças e beneficiários foi indevidamente exposto.

**Why this priority**: Constrói a reputação e a confiança institucional do Instituto Ebenézer perante a sociedade civil, viabilizando captações maiores de recursos com estrita conformidade à LGPD e ao ECA.

**Independent Test**: Operador da área de projetos submete um novo lote de indicadores institucionais com evidências privadas anexadas; o sistema impede que o mesmo operador aprove o lote; o diretor com perfil `APPROVER` revisa as evidências, aprova a publicação e a página pública é atualizada com a nova versão consolidada e histórico preservado.

**Acceptance Scenarios**:

1. **Given** um operador com papel `COMMUNICATION` cadastrando uma nova medição de impacto, **When** submete para publicação, **Then** o sistema marca o indicador como `PENDING_APPROVAL` e bloqueia a auto-aprovação pelo próprio autor.
2. **Given** um indicador aguardando aprovação, **When** o usuário com perfil `APPROVER` analisa as evidências anexadas e aprova, **Then** a métrica é publicada na página pública e as evidências confidenciais contendo dados de crianças permanecem restritas ao ambiente seguro e privado.

---

### Edge Cases

- **Webhook recebido fora de ordem (antes da confirmação da requisição inicial)**: O sistema persiste o evento bruto e, caso a intenção ainda conste em processamento local, a máquina de estados aguarda ou reconcilia o status sem sobrescrever a transação com dados atrasados.
- **Pagamento com valor divergente da cobrança emitida**: O pagamento é retido em quarentena contábil com status `DIVERGENT` e sinalizado imediatamente no painel do financeiro para verificação com o doador ou com o PSP.
- **Recebimento de Pix direto na chave Pix do Instituto sem intenção prévia criada**: O sistema identifica a entrada avulsa através da conciliação do extrato disponibilizado pelo PSP ou banco, registrando um lançamento como `UNMATCHED` para triagem da equipe.
- **Falha momentânea ou indisponibilidade da API do parceiro PSP durante o checkout**: A interface não gera QR Code inválido ou simulado localmente; informa educadamente ao doador sobre a indisponibilidade momentânea da rede bancária e orienta tentar novamente em instantes.
- **Cancelamento de doação ou pedido de estorno/devolução**: O sistema gera um lançamento financeiro compensatório vinculado à transação original, mantendo a imutabilidade do registro original e ajustando o saldo líquido nos relatórios.
- **Tentativas abusivas de geração de cobranças (ataques de negação de serviço ou raspagem)**: Aplicação de limites de taxa (rate limiting) por endereço IP e por e-mail nas rotas de emissão de cobranças.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma página de checkout responsiva para captura de doações pontuais, permitindo selecionar campanhas cadastradas e valores sugeridos ou personalizados.
- **FR-002**: O sistema DEVE solicitar apenas dados mínimos de contato do doador (nome completo e e-mail). A coleta de CPF é OPCIONAL na doação pontual, sendo solicitada e validada apenas caso o doador requisite explicitamente recibo nominal identificado com CPF (em conformidade com o princípio de minimização da LGPD).
- **FR-003**: O sistema DEVE fornecer opção separada e desmarcada por padrão para consentimento de recebimento de comunicações institucionais (marketing), garantindo conformidade com a LGPD.
- **FR-004**: O sistema DEVE criar um registro único de intenção de doação (`DonationIntent`) com identificador universal antes de requisitar a cobrança ao PSP.
- **FR-005**: O sistema DEVE solicitar ao parceiro de pagamentos (PSP) a geração de cobrança Pix dinâmica com chave de idempotência exclusiva, recebendo e persistindo o identificador externo do PSP (`txid`), QR Code e linha Copia e Cola oficiais, além do horário exato de expiração. A arquitetura utilizará um adaptador de PSP desacoplado com suporte inicial a Asaas/Efí e simulador sandbox nativo para testes e homologação. Em nenhuma hipótese o sistema gerará QR Codes locais artificiais sem o PSP ou mock de sandbox correspondente.
- **FR-006**: A interface de doação DEVE atualizar o status de pagamento via consulta periódica (polling) com intervalo controlado e recuo progressivo (backoff), exibindo confirmação somente após a validação do evento financeiro pelo backend.
- **FR-007**: O sistema DEVE expor um endpoint seguro para recebimento de webhooks do PSP, exigindo validação de autenticidade (verificação de assinatura de payload / token de webhook do adaptador configurado) antes do processamento.
- **FR-008**: O endpoint de webhook DEVE persistir o payload bruto do evento em armazenamento durável (`PspEvent`) com chave única antes de emitir resposta HTTP 2xx ao provedor, garantindo tolerância a falhas e desacoplamento do processamento de negócio.
- **FR-009**: O processamento de eventos DEVE ser idempotente e verificar correspondência exata entre o identificador externo da cobrança, valor pago e a intenção associada, registrando a transação em `PaymentTransaction` única.
- **FR-010**: O sistema DEVE enviar comprovante transacional de agradecimento por e-mail com garantia de envio único (idempotência no envio de comunicações) através de serviço de e-mail transacional (ex: Resend/SMTP seguro com fila).
- **FR-011**: O sistema DEVE manter estrita segregação de estados entre intenções (`DonationIntent`), cobranças emitidas (`PspCharge`), eventos recebidos (`PspEvent`), transações confirmadas (`PaymentTransaction`), lançamentos contábeis (`FinancialEntry`) e conciliação (`ReconciliationItem`).
- **FR-012**: O sistema DEVE tratar todas as exceções da Matriz Financeira (duplicatas, eventos fora de ordem, intenções expiradas com pagamento posterior, divergências de valor e pagamentos avulsos), direcionando desvios para a Caixa de Exceções sem descarte financeiro.
- **FR-013**: O sistema DEVE fornecer painel administrativo com controle de acesso baseado em papéis (RBAC: `ADMIN`, `FINANCE`, `COMMUNICATION`, `APPROVER`, `AUDITOR_READONLY`) e exigir autenticação segura com múltiplos fatores (MFA).
- **FR-014**: O sistema DEVE fornecer ferramenta de conciliação assistida para a equipe financeira confrontar os lançamentos do sistema com as cobranças e repasses fornecidos pelo PSP e extrato bancário, com justificativa obrigatória e registro na trilha de auditoria.
- **FR-015**: O sistema DEVE manter privadas e protegidas por padrão todas as evidências institucionais contendo dados de crianças, adolescentes e famílias beneficiárias, proibindo sua publicação em áreas abertas ou exibição em logs da aplicação.
- **FR-016**: Funcionalidades referentes a Pix Automático (Fase 2) e Cofre de Números completo com publicação Maker-Checker (Fase 3) PERMANECEM BLOQUEADAS para desenvolvimento produtivo até que as decisões de governança `[DECISÃO-06]` e `[DECISÃO-07]` sejam formalmente aprovadas.

### Key Entities

- **Doador (`Donor`)**: Representa a pessoa física que realiza a contribuição. Contém nome, e-mail, telefone opcional, CPF (quando legalmente ou contratualmente exigido), preferências de consentimento de marketing e data de criação.
- **Intenção de Doação (`DonationIntent`)**: Representa o desejo manifestado de doar. Contém código único, referência ao doador, campanha escolhida, valor pretendido, status (`CREATED`, `AWAITING_PAYMENT`, `PAID`, `EXPIRED`, `CANCELLED`, `LATE_PAYMENT_REVIEW`), data de criação e expiração.
- **Cobrança no Provedor (`PspCharge`)**: Dados da cobrança gerada junto ao PSP. Contém chave de idempotência enviada, identificador do PSP (`txid`), payload do QR Code, linha Copia e Cola, valor registrado no parceiro, data de expiração e status no parceiro.
- **Evento de Notificação (`PspEvent`)**: Registro durável e imutável de cada webhook recebido. Contém identificador único do evento, payload JSON bruto, cabeçalhos de autenticação, data/hora de recepção, status de processamento (`PENDING`, `PROCESSED`, `DUPLICATE`, `FAILED`, `SUSPICIOUS`) e tentativas de reprocessamento.
- **Transação de Pagamento (`PaymentTransaction`)**: Fato financeiro comprovado de pagamento ou estorno. Identificado unicamente pelo par `(psp_id, external_transaction_id)`. Vinculado à cobrança e à intenção, contém valor efetivamente pago, data/hora da liquidação pelo PSP, tipo (`PAYMENT` ou `REFUND`) e vínculo com lançamentos originais.
- **Lançamento Financeiro (`FinancialEntry`)**: Registro contábil imutável para apuração de saldo e prestação de contas. Permite calcular a receita líquida e não é passível de edição destrutiva.
- **Item de Conciliação (`ReconciliationItem`)**: Estado de batimento entre a transação do sistema e o extrato/repasse financeiro do banco/PSP. Status: `UNMATCHED`, `MATCHED_PSP`, `SETTLED`, `DIVERGENT`, `UNDER_REVIEW`. Contém histórico de reconciliação, justificativa e responsável.
- **Registro de Auditoria (`AuditEvent`)**: Trilha cronológica de segurança que registra autor, ação, entidade afetada, IP, data/hora e justificativa para todas as operações sensíveis do back-office.
- **Autorização Recorrente (`RecurringAuthorization` - Fase 2)**: Autorização de débito recorrente no Pix Automático vinculado a um doador.
- **Indicador de Impacto (`ImpactIndicator` - Fases 2/3)**: Métrica agregada institucional aprovada por governança Maker-Checker para publicação de transparência.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 95% dos doadores que concluem o pagamento Pix no aplicativo do banco visualizam a tela de confirmação de doação em até 5 segundos.
- **SC-002**: 100% dos eventos da Matriz de Exceções Financeiras (duplicados, fora de ordem, expirados com pagamento, divergentes e órfãos) tratados sem inconsistência contábil e sem perda de valor financeiro.
- **SC-003**: Zero registros de transação financeira ou receita duplicada gerados por reenvios de webhooks do PSP parceiro.
- **SC-004**: Redução de pelo menos 70% no tempo despendido mensalmente pela equipe financeira na conciliação de doações em comparação com o processo de controle manual em planilhas.
- **SC-005**: 100% dos envios de comprovantes transacionais de e-mail realizados de forma única (idempotência no envio de e-mails para cada transação confirmada).
- **SC-006**: 100% das comunicações de marketing restritas aos doadores que marcaram expressamente o opt-in na finalização da doação.
- **SC-007**: Zero exposição de dados pessoais ou identificadores de beneficiários assistidos (especialmente crianças e adolescentes) em telas públicas, logs de aplicação ou relatórios abertos.

## Assumptions

- **A-001**: O Instituto Ebenézer contratará uma conta institucional junto a um PSP brasileiro homologado pelo Banco Central com suporte a emissão dinâmica de Pix via API e envio de webhooks autenticados.
- **A-002**: Para o escopo de MVP 1, o sistema funcionará como monólito modular de locatário único (single-tenant), atendendo exclusivamente ao Instituto Ebenézer.
- **A-003**: A aplicação frontend e backend operará sob protocolo HTTPS obrigatório com suporte a cabeçalhos de segurança padrão da indústria (HSTS, CSP, X-Frame-Options).
- **A-004**: O comprovante gerado e enviado por e-mail após a doação tem finalidade estritamente transacional de recibo de contribuição e agradecimento, não constituindo documento fiscal ou dedutível de imposto sem validação contábil prévia da instituição.
- **A-005**: As funcionalidades de Pix Automático (Fase 2) e Cofre de Números (Fase 3) serão projetadas em modelo de dados e contratos modulares para garantir extensibilidade futura, mas não terão fluxos ativos em produção no MVP 1.

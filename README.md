# 🌿 Instituto Social Ebenézer — Plataforma Ebenézer Recorrente

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-39%20passed-green.svg)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![LGPD](https://img.shields.io/badge/LGPD-Compliant-success.svg)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

Plataforma integrada de captação de recursos, doações pontuais e recorrentes (Pix Automático Bacen e Cartão de Crédito PCI-DSS), transparência assistencial, governança de dados (LGPD) e retaguarda financeira/operacional desenvolvida para o **Instituto de Cultura e Lazer Ebenézer** (Jardim Ângela, São Paulo - SP).

---

## 🎨 Design System Oficial

A plataforma adota fielmente os tokens e a identidade visual oficial do [Instituto Social Ebenézer](https://www.institutosocialebenezer.com.br/):

- **Tipografia**: [Google Fonts Montserrat](https://fonts.google.com/specimen/Montserrat) (pesos 300 a 900)
- **Cores Principais**:
  - `Electric Lime Green` (`#00FB00` / hover `#00DB00`): Ações de conversão primárias, botões CTA e badges ativas.
  - `Deep Midnight Navy` (`#101625`): Banners hero, cabeçalhos, rodapé curvo e painel lateral.
  - `Slate Navy Text` (`#2C394C`): Textos descritivos e tipografia neutra de alta legibilidade.
  - `Ice Background` (`#EFF3F8`): Superfícies de cartões de valores, tabelas e inputs.
- **Geometria**: Botões principais no estilo *pill* (`rounded-[300px]`) e cartões com cantos arredondados (`rounded-[20px]` a `rounded-[28px]`).
- **Logotipos Vetoriais Oficiais**: Símbolo da árvore Ebenézer em versões claro (`/logo.svg`) e escuro (`/logo-white.svg`).

---

## 🚀 Funcionalidades & Arquitetura

### 1. Jornada do Doador (D1 a D7)
- **D1 (Seleção de Valor e Frequência)**: Alternância fluida entre Doação Única e Doação Mensal (Recorrente); valores rápidos (R$ 25, R$ 50, R$ 100, R$ 200) ou valor personalizado.
- **D2 (Identificação e Modo Anônimo)**: Coleta mínima de dados (Nome e E-mail). Opção de doação anônima (sem documento gravado) e CPF estritamente opcional (apenas para emissão de recibo nominal).
- **D3 (Pagamento Pix ou Cartão)**:
  - **Pix Instantâneo**: QR Code dinâmico, código Copia e Cola, contador regressivo e polling com verificação em tempo real.
  - **Cartão de Crédito**: Criptografia PCI-DSS de 256 bits sem retenção de dados sensíveis (número e CVV).
- **D4 (Confirmação e Convite à Recorrência)**: Hero Card em `#101625` e botão pill `#00FB00` convidando doadores pontuais para a causa mensal (*"Posso ajudar todo mês!"*).
- **D5 (Ativação Guiada Pix Automático)**: Resumo transparente dos dados antes da autorização (Favorecido, CNPJ `30.434.044/0001-90`, débito no dia 5).
- **D6 (Recorrência Ativa & Impacto Acumulado)**: Exibição do valor total acumulado já investido pelo doador nas ações do Jardim Ângela e gestão de cancelamento em menos de 3 segundos sem carência.
- **D7 (Prestação de Contas & Transparência)**: Consulta de indicadores sociais homologados e seção obrigatória **"O que ainda não conseguimos medir"** (Transparência Radical).

### 2. Área do Doador & Direitos LGPD
- **Login sem senha (OTP / Magic Code)**: Acesso via código de 6 dígitos enviado por e-mail (validade de 15 minutos).
- **Gestão de Assinaturas**: Visualização de ciclos de cobrança e cancelamento em 1 clique.
- **Direitos do Titular (Art. 18 LGPD)**: Atualização de consentimentos de marketing e opção de anonimização permanente de cadastro.

### 3. Página de Privacidade & Governança LGPD
- Acessível diretamente pelo rodapé (*"Privacidade & LGPD Garantidas"*).
- Regras de conformidade estrita: Minimização de dados, **proteção integral de crianças e adolescentes (Art. 14 LGPD & ECA)** sem exposição pública de fotos ou nomes de acolhidos, segurança bancária e canal direto com o DPO (`privacidade@institutosocialebenezer.com.br`).

### 4. Back-office Operacional com RBAC & MFA (O1 a O6)
- **Painel Geral (O1)**: KPIs consolidados, MRR, churn rate, volume captado e atalhos rápidos.
- **Gestão de Doadores (O2/O3)**: Listagem com filtros por perfil (Recorrentes, Pontuais, Prontos para Convite) e detalhe do histórico com linha do tempo de interações.
- **Régua de Relacionamento (O4)**: Disparo de e-mails transacionais com pré-visualização no Design System oficial.
- **Cofre de Indicadores (O5)**: Gestão de métricas com dupla aprovação segregada (**Maker-Checker**) e auditoria de fontes reais.
- **Prestação de Contas & Matriz de Exceções (O6)**: Reconciliação bancária, quarentena de divergências e exportação fiscal em CSV.

---

## 🔐 Credenciais de Acesso para Testes no Back-office

| Perfil | E-mail | Senha | Código MFA | Permissões |
| :--- | :--- | :--- | :--- | :--- |
| **Coordenação (Admin)** | `coordenacao@ebenezer.org.br` | `coord123` | `123456` | Acesso total, aprovação e exportação |
| **Comunicação (Maker)** | `comunicacao@ebenezer.org.br` | `com123` | `123456` | Régua, doadores e submissão ao cofre |
| **Financeiro (Checker)** | `financeiro@ebenezer.org.br` | `fin123` | `123456` | Conciliação, quarentena e homologação |

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, QRCode SVG
- **Backend**: Node.js, Express, TypeScript, Zod, UUID, Crypto nativo
- **Testes**: Vitest (39 testes unitários e de integração com cobertura de exceções financeiras e idempotência)
- **Monorepo**: NPM Workspaces (`frontend` + `backend`)

---

## 📦 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- NPM 9+ instalado

### 1. Clonar ou Acessar o Repositório
```bash
git clone https://github.com/<seu-usuario>/<seu-repositorio>.git
cd <seu-repositorio>
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Iniciar os Servidores em Modo de Desenvolvimento
Em terminais separados (ou em segundo plano):

```bash
# Terminal 1: Iniciar Backend API (porta 3000)
npm run dev:backend

# Terminal 2: Iniciar Frontend Vite (porta 5173)
npm run dev:frontend
```

Acesse no navegador:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Backend**: [http://localhost:3000](http://localhost:3000)

### 4. Executar os Testes Automatizados
```bash
npm test
```

### 5. Compilar para Produção (Build)
```bash
npm run build
```

---

## 🏛️ Dados Institucionais Oficiais

- **Razão Social**: Instituto de Cultura e Lazer Ebenézer
- **CNPJ**: `30.434.044/0001-90`
- **Endereço**: R. José Ribeiro Ramos, 31 - Jardim Angela, São Paulo - SP, CEP 05878-110
- **Site Oficial**: [institutosocialebenezer.com.br](https://www.institutosocialebenezer.com.br/)
- **Canal DPO / Privacidade**: `privacidade@institutosocialebenezer.com.br`

---

## 📄 Licença

Uso institucional restrito ao Instituto de Cultura e Lazer Ebenézer. Todos os direitos reservados.

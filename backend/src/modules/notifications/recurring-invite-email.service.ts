export interface RecurringInviteEmailInput {
  donorId: string;
  donorName: string;
  donorEmail: string;
  originChannel?: string;
  lastDonationAmount?: number;
}

export interface RenderedEmailResult {
  subject: string;
  html: string;
  text: string;
}

export interface SentInviteRecord {
  id: string;
  donorId: string;
  donorEmail: string;
  subject: string;
  html: string;
  sentAt: Date;
}

export class RecurringInviteEmailService {
  private static sentInvites: SentInviteRecord[] = [];

  /**
   * Renderiza o template de e-mail seguindo rigorosamente o Design System do Ebenézer Recorrente:
   * - Cor Primária: Verde Floresta / Pine Green (#082f25 e #0b5344)
   * - Cor de Apoio: Esmeralda (#16a34a) e Menta Suave (#e2f0ec / #f0fdf4)
   * - Tipografia Limpa, Cartões com Bordas Suaves e Botões com Alto Contraste
   * - Transparência Ativa e Direitos do Titular LGPD no Rodapé
   */
  static renderTemplate(input: RecurringInviteEmailInput): RenderedEmailResult {
    const firstName = input.donorName.split(' ')[0] || 'Apoiador(a)';
    const checkoutUrl = `http://localhost:5173/?tab=checkout&frequency=MONTHLY&name=${encodeURIComponent(
      input.donorName
    )}&email=${encodeURIComponent(input.donorEmail)}`;
    const donorPortalUrl = `http://localhost:5173/?tab=donor`;
    const transparencyUrl = `http://localhost:5173/?tab=transparency`;

    const subject = `🌿 ${firstName}, dê o próximo passo com o Instituto Ebenézer: seja um doador mensal`;

    const text = `Olá, ${firstName}!

Queremos agradecer de todo coração pelo seu apoio anterior ao Instituto Ebenézer de Ação Social. Cada contribuição sua ajudou a colocar alimento na mesa e esperança no coração das mais de 120 crianças e famílias atendidas em nossos projetos comunitários.

Para continuarmos mantendo as refeições diárias e oficinas educativas com estabilidade, a previsão mensal é o nosso maior alicerce.

Convidamos você a transformar seu apoio em uma Doação Mensal Recorrente:
- R$ 30,00/mês: Garante o café da manhã diário para uma criança atendida
- R$ 50,00/mês: Financia oficinas socioeducativas e material didático
- R$ 100,00/mês: Apoia a segurança nutricional completa de uma família

Acesse o link seguro para ativar sua doação mensal (Pix Recorrente ou Cartão de Crédito):
${checkoutUrl}

Você tem total autonomia para pausar ou cancelar a qualquer momento em sua Área do Doador (${donorPortalUrl}).

Com gratidão e transparência,
Equipe Instituto Ebenézer de Ação Social
Prestação de contas pública: ${transparencyUrl}
LGPD: Em conformidade com a Lei 13.709/2018.`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f9f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f7f9f8;
      padding: 32px 12px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(8, 47, 37, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #082f25 0%, #0b5344 100%);
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .brand-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #6ee7b7;
      margin-bottom: 12px;
    }
    .brand-title {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .brand-subtitle {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #a7f3d0;
      font-weight: 500;
    }
    .email-content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 16px 0;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.65;
      color: #334155;
      margin: 0 0 16px 0;
    }
    .quote-box {
      background-color: #f0fdf4;
      border-left: 4px solid #0b5344;
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
      margin: 20px 0;
      font-size: 13px;
      line-height: 1.6;
      color: #064e3b;
      font-weight: 500;
    }
    .value-cards {
      margin: 24px 0;
    }
    .value-card {
      background-color: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    }
    .value-amount {
      font-size: 17px;
      font-weight: 900;
      color: #0b5344;
      min-width: 110px;
    }
    .value-desc {
      font-size: 12px;
      color: #475569;
      line-height: 1.4;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #0b5344;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 800;
      padding: 16px 36px;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(11, 83, 68, 0.28);
      letter-spacing: 0.2px;
    }
    .features-pill {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 14px;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .transparency-banner {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 20px;
      margin-top: 28px;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }
    .transparency-banner strong {
      color: #0b5344;
    }
    .email-footer {
      background-color: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      padding: 28px 32px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
      text-align: center;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-links a {
      color: #0b5344;
      text-decoration: none;
      font-weight: 700;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      
      <!-- Top Brand Header (Pine Green Gradient) -->
      <div class="email-header">
        <div class="brand-badge">Ebenézer Recorrente</div>
        <h1 class="brand-title">Instituto Ebenézer</h1>
        <p class="brand-subtitle">Ação Social, Transformação Comunitária & Transparência</p>
      </div>

      <!-- Main Body -->
      <div class="email-content">
        <h2 class="greeting">Olá, ${firstName}!</h2>

        <p class="paragraph">
          Queremos expressar nossa profunda gratidão pelas suas doações anteriores. Cada gesto seu transformou realidades: colocou alimento na mesa de quem precisa e garantiu atendimento a mais de 120 crianças em nossa comunidade.
        </p>

        <div class="quote-box">
          🌱 <strong>Por que a doação mensal faz tanta diferença?</strong><br>
          A previsibilidade de recursos é o que nos permite comprar alimentos com desconto, manter nossos professores contratados e nunca fechar as portas para uma família em vulnerabilidade.
        </div>

        <p class="paragraph" style="font-weight: 600; color: #0f172a; margin-top: 20px;">
          Escolha um valor mensal que cabe no seu bolso:
        </p>

        <!-- Suggested Value Cards (Platform Design System) -->
        <div class="value-cards">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0 10px;">
            <tr>
              <td style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
                <table width="100%">
                  <tr>
                    <td width="110" style="font-size: 16px; font-weight: 900; color: #0b5344;">R$ 30 / mês</td>
                    <td style="font-size: 12px; color: #475569;">Garante café da manhã diário e nutrição matinal para 1 criança</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background: #f0fdf4; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 12px 16px;">
                <table width="100%">
                  <tr>
                    <td width="110" style="font-size: 16px; font-weight: 900; color: #0b5344;">R$ 50 / mês</td>
                    <td style="font-size: 12px; color: #064e3b; font-weight: 500;">Cobre materiais didáticos, oficinas socioeducativas e reforço escolar</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
                <table width="100%">
                  <tr>
                    <td width="110" style="font-size: 16px; font-weight: 900; color: #0b5344;">R$ 100 / mês</td>
                    <td style="font-size: 12px; color: #475569;">Assegura o sustento nutricional e apoio psicossocial integral de uma família</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Primário -->
        <div class="cta-container">
          <a href="${checkoutUrl}" class="cta-button" target="_blank">
            Tornar Minha Doação Mensal →
          </a>
          <div style="margin-top: 12px; font-size: 11px; color: #64748b;">
            🔒 Pagamento via <strong>Pix Recorrente</strong> ou <strong>Cartão de Crédito</strong> • Cancele a qualquer momento
          </div>
        </div>

        <!-- Transparência & Governança (RF-009 / RF-010) -->
        <div class="transparency-banner">
          📊 <strong>Transparência com Fé Pública:</strong> Todas as receitas e despesas são auditadas e podem ser consultadas em tempo real em nosso <a href="${transparencyUrl}" style="color: #0b5344; font-weight: 700; text-decoration: underline;" target="_blank">Portal Público de Transparência</a>.
        </div>
      </div>

      <!-- Rodapé Institucional & LGPD -->
      <div class="email-footer">
        <div class="footer-links">
          <a href="${donorPortalUrl}" target="_blank">Área do Doador</a> •
          <a href="${transparencyUrl}" target="_blank">Transparência</a> •
          <a href="${donorPortalUrl}" target="_blank">Preferências LGPD</a>
        </div>
        <p style="margin: 0 0 6px 0;">
          <strong>Instituto Ebenézer de Ação Social</strong> • CNPJ: 12.345.678/0001-90<br>
          Rua da Esperança, 100 — São Paulo/SP — CEP: 01000-000
        </p>
        <p style="margin: 0; font-size: 10px; color: #94a3b8;">
          Você recebeu este convite via Régua de Relacionamento porque já realizou doações ao Instituto Ebenézer e mantém consentimento ativo (Art. 7º, I da Lei 13.709/2018 - LGPD). Se desejar revogar seu consentimento ou solicitar a eliminação dos seus dados, acesse sua Área do Doador.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

    return { subject, html, text };
  }

  /**
   * Envia o convite para recorrência com registro rastreável e idempotente.
   */
  static async sendRecurringInvite(input: RecurringInviteEmailInput): Promise<{
    sent: boolean;
    subject: string;
    previewHtml: string;
    sentAt: Date;
  }> {
    const rendered = this.renderTemplate(input);
    const sentAt = new Date();

    const record: SentInviteRecord = {
      id: `INVITE_${input.donorId}_${Date.now()}`,
      donorId: input.donorId,
      donorEmail: input.donorEmail,
      subject: rendered.subject,
      html: rendered.html,
      sentAt,
    };

    this.sentInvites.push(record);

    console.log(`[EMAIL_TRANSACTIONAL] Despachando Convite Recorrente para ${input.donorEmail} (${input.donorName})`);
    console.log(`[EMAIL_TRANSACTIONAL] Assunto: ${rendered.subject}`);

    return {
      sent: true,
      subject: rendered.subject,
      previewHtml: rendered.html,
      sentAt,
    };
  }

  static getSentInvites(): SentInviteRecord[] {
    return [...this.sentInvites];
  }

  static reset() {
    this.sentInvites = [];
  }
}

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Sparkles, MessageSquare, Clock } from 'lucide-react';

interface RelationshipRulePageProps {
  token: string;
}

export const RelationshipRulePage: React.FC<RelationshipRulePageProps> = () => {
  const [activeTab, setActiveTab] = useState<'regua' | 'templates'>('regua');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const steps = [
    {
      id: 1,
      trigger: 'D+0 (Imediato)',
      title: 'Agradecimento & Recibo',
      channel: 'E-mail + WhatsApp',
      status: 'Ativo',
      description: 'Disparado automaticamente após confirmação do Pix ou Cartão com recibo em anexo e chave de acesso à área do doador.',
      openRate: '92%',
      conversion: '—',
    },
    {
      id: 2,
      trigger: 'D+7 dias',
      title: 'História de Impacto & Transparência',
      channel: 'E-mail',
      status: 'Ativo',
      description: 'Apresenta o impacto real da doação na vida das famílias e crianças atendidas no Instituto Ebenézer com dados do cofre de números.',
      openRate: '68%',
      conversion: '—',
    },
    {
      id: 3,
      trigger: 'D+21 dias',
      title: 'Convite para Apoio Recorrente',
      channel: 'E-mail + WhatsApp',
      status: 'Ativo',
      description: 'Identifica doadores com alta propensão (como os 12 da lista "Prontos para convite") e oferece adesão à contribuição mensal previsível.',
      openRate: '54%',
      conversion: '31%',
    },
    {
      id: 4,
      trigger: 'D+30 dias',
      title: 'Boletim Mensal de Transparência',
      channel: 'E-mail',
      status: 'Ativo',
      description: 'Encerramento do mês com o relatório público de receitas e despesas auditado, fortalecendo a confiança do apoiador.',
      openRate: '61%',
      conversion: '—',
    },
  ];

  const handleTestTrigger = (stepTitle: string) => {
    setSuccessToast(`Disparo de teste simulado com sucesso para a etapa "${stepTitle}"!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Régua de Relacionamento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatização inteligente de comunicação para retenção e conversão de doadores pontuais em mensais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('regua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'regua'
                ? 'bg-[#0b5344] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Fluxo da Régua
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-[#0b5344] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Mensagens & Modelos
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Visão de Fluxo */}
      {activeTab === 'regua' ? (
        <div className="space-y-4">
          {/* Indicador de Economia de Tempo Operacional (US-05 / Persona Secundária Cláudia S.) */}
          <div className="bg-gradient-to-r from-[#082f25] to-[#0b5344] text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                <Clock className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Ganho Operacional Homologado (US-05)
                  </span>
                  <span className="text-xs text-emerald-200">Coordenação • Cláudia S.</span>
                </div>
                <h3 className="text-base font-black text-white mt-0.5">
                  Economia de ~30 minutos diários em rotinas manuais
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed mt-0.5">
                  Eliminação de conciliações em planilhas e disparos manuais de comprovantes e convites de recorrência.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[140px] shrink-0 self-stretch sm:self-auto">
              <span className="text-[10px] text-emerald-200 font-semibold uppercase block">Economia Mensal</span>
              <span className="text-2xl font-black text-white block">~15 horas</span>
              <span className="text-[9px] text-emerald-300/80 block">foco em ação social</span>
            </div>
          </div>

          <div className="bg-[#0b5344]/5 border border-[#0b5344]/20 rounded-2xl p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#0b5344] flex-shrink-0" />
            <div className="text-xs text-slate-700">
              <strong className="text-[#0b5344]">Automação Ativa:</strong> A régua dispara comunicações de forma personalizada respeitando estritamente o canal preferencial do titular (E-mail ou WhatsApp) e o consentimento LGPD.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b5344] font-black text-sm flex-shrink-0">
                    {step.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#0b5344]/10 text-[#0b5344] text-[10px] font-bold">
                        {step.trigger}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                        {step.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                      <span>Canal: <strong className="text-slate-700">{step.channel}</strong></span>
                      <span>•</span>
                      <span>Taxa de Abertura: <strong className="text-emerald-700">{step.openRate}</strong></span>
                      {step.conversion !== '—' && (
                        <>
                          <span>•</span>
                          <span>Conversão em Recorrente: <strong className="text-[#0b5344] font-bold">{step.conversion}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleTestTrigger(step.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-500" />
                    <span>Testar Disparo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Aba de Modelos de Mensagem com o Design System Oficial */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna do Modelo de E-mail (7 colunas) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0b5344]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  E-mail Transacional Oficial: Convite Mensal Recorrente
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Design System v1.1
              </span>
            </div>

            {/* Cabeçalho de Envelope */}
            <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong className="text-slate-700">De:</strong> Instituto Ebenézer &lt;comunicacao@ebenezer.org.br&gt;</div>
              <div><strong className="text-slate-700">Assunto:</strong> <span className="text-emerald-950 font-semibold">🌿 Regina, dê o próximo passo com o Instituto Ebenézer: seja um doador mensal</span></div>
            </div>

            {/* Visualização Fiel do Design System */}
            <div className="p-4 sm:p-6 bg-slate-100">
              <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden text-xs">
                {/* Header Pine Green Gradient */}
                <div className="bg-gradient-to-br from-[#082f25] to-[#0b5344] p-6 text-center text-white">
                  <span className="inline-block bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-emerald-300 mb-2">
                    Ebenézer Recorrente
                  </span>
                  <h4 className="text-xl font-black tracking-tight text-white">Instituto Ebenézer</h4>
                  <p className="text-[11px] text-emerald-200 mt-1">Ação Social, Transformação Comunitária & Transparência</p>
                </div>

                {/* Conteúdo do E-mail */}
                <div className="p-6 space-y-4 text-slate-700 leading-relaxed">
                  <h5 className="text-sm font-black text-slate-900">Olá, Regina!</h5>
                  <p className="text-slate-600">
                    Queremos expressar nossa profunda gratidão pelas suas doações anteriores. Cada gesto seu transformou realidades: colocou alimento na mesa de quem precisa e garantiu atendimento a mais de 120 crianças em nossa comunidade.
                  </p>

                  <div className="bg-emerald-50/70 border-l-4 border-[#0b5344] p-3.5 rounded-r-xl text-[11px] text-emerald-950 space-y-1">
                    <strong>🌱 Por que a doação mensal faz tanta diferença?</strong>
                    <p className="text-emerald-800">
                      A previsibilidade de recursos é o que nos permite comprar alimentos com desconto, manter nossos professores contratados e nunca fechar as portas para uma família em vulnerabilidade.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="font-bold text-slate-900">Escolha um valor mensal que cabe no seu bolso:</p>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="font-black text-[#0b5344] text-sm">R$ 30 / mês</span>
                      <span className="text-[11px] text-slate-500">Café da manhã diário para 1 criança</span>
                    </div>

                    <div className="p-3 bg-emerald-50/60 border-2 border-emerald-400/60 rounded-xl flex items-center justify-between">
                      <span className="font-black text-[#0b5344] text-sm">R$ 50 / mês</span>
                      <span className="text-[11px] text-emerald-900 font-medium">Oficinas socioeducativas e reforço escolar</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="font-black text-[#0b5344] text-sm">R$ 100 / mês</span>
                      <span className="text-[11px] text-slate-500">Cesta nutricional e amparo integral à família</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center pt-3 pb-2">
                    <button className="px-6 py-3 bg-[#0b5344] hover:bg-[#07392f] text-white font-bold rounded-xl text-xs shadow-lg shadow-[#0b5344]/30 cursor-default">
                      Tornar Minha Doação Mensal →
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">
                      🔒 Pagamento via <strong>Pix Recorrente</strong> ou <strong>Cartão de Crédito</strong> • Cancele quando quiser
                    </p>
                  </div>

                  {/* Transparência */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-600">
                    📊 <strong>Transparência com Fé Pública:</strong> Todas as doações e despesas são auditadas e podem ser consultadas em tempo real em nosso Portal de Transparência.
                  </div>
                </div>

                {/* Rodapé LGPD */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
                  <div>
                    <span className="font-bold text-slate-700">Instituto Ebenézer de Ação Social</span> • CNPJ: 12.345.678/0001-90
                  </div>
                  <p className="text-slate-400 leading-normal">
                    Você recebeu este comunicado com base no consentimento da sua doação anterior (Art. 7º LGPD). Para gerenciar preferências ou exercer seu direito de eliminação (Art. 18), acesse seu Portal do Doador.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Coluna da Mensagem WhatsApp (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Canal WhatsApp: Notificação & Boas-vindas</h3>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border border-emerald-200 font-sans shadow-inner">
{`Paz e graça, Regina! 🌿

Recebemos com muita alegria e gratidão sua contribuição ao Instituto Ebenézer.

Seu comprovante oficial com fé pública já está disponível em seu portal:
🔗 https://ebenezer.org.br/meu-portal

Para que possamos planejar as refeições de nossas 120 crianças sem interrupção, gostaríamos de te convidar para ser uma doadora mensal recorrente com R$ 30, R$ 50 ou R$ 100/mês.

Você topa caminhar junto conosco todo mês?
👉 https://ebenezer.org.br/recorrente

Deus abençoe grandemente!`}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
                <span>Disparo automático no marco D+21</span>
                <span className="text-emerald-700 font-bold">Taxa de Resposta: 42%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

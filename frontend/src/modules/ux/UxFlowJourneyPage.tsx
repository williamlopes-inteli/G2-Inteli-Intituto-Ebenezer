import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  User,
  GitBranch,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Eye,
  Layers
} from 'lucide-react';

interface UxFlowJourneyPageProps {
  onNavigateToTab?: (tab: string) => void;
}

interface ScreenItem {
  id: string;
  code: string;
  title: string;
  role: string;
  description: string;
  targetStory: string;
  acceptance: string;
  sentiment?: string;
  actionHint?: string;
}

export const UxFlowJourneyPage: React.FC<UxFlowJourneyPageProps> = ({ onNavigateToTab }) => {
  const [activeSection, setActiveSection] = useState<'fluxo' | 'jornada' | 'personas' | 'validacao'>('fluxo');
  const [selectedScreen, setSelectedScreen] = useState<string>('D1');

  // Dados das Telas do Doador (Mobile D1 - D7)
  const donorScreens: ScreenItem[] = [
    {
      id: 'D1',
      code: 'D1',
      title: 'Landing Page de Doação',
      role: 'Mobile Doador',
      description: 'Primeiro ponto de contato. Comunica a seriedade da instituição, causas sociais apoiadas, toggle de frequência (Única / Mensal) e valores sugeridos (R$ 25, R$ 50, R$ 100).',
      targetStory: 'US-01',
      acceptance: 'Valores sugeridos visíveis; opção de valor customizado; toggle mensal / único.',
      sentiment: 'Confiante ("Visual limpo, confio")',
      actionHint: 'Acessar tela no app: Aba "Fazer Doação"',
    },
    {
      id: 'D2',
      code: 'D2',
      title: 'Identificação do Doador',
      role: 'Mobile Doador',
      description: 'Formulário minimalista com foco em redução de atrito e minimização LGPD. Conta com opção explícita: "Doar sem se identificar (anônimo)".',
      targetStory: 'US-02',
      acceptance: 'Coleta opcional de CPF para fins fiscais; opção de anonimato em 1 clique.',
      sentiment: 'Confortável ("Simples e rápido")',
      actionHint: 'Acessar tela no app: Formulário de checkout',
    },
    {
      id: 'D3',
      code: 'D3',
      title: 'Geração e Pagamento Pix',
      role: 'Mobile Doador',
      description: 'Emissão dinâmica imediata de QR Code e código copia-e-cola com instruções amigáveis e countdown regressivo de 30 minutos.',
      targetStory: 'US-02',
      acceptance: 'QR Code gerado; código copiável; countdown de 30 min; botão de confirmação.',
      sentiment: 'Satisfeito ("Fácil, sem burocracia")',
      actionHint: 'Acessar tela no app: Selecionar Pix e gerar pagamento',
    },
    {
      id: 'D4',
      code: 'D4',
      title: 'Confirmação & Convite à Recorrência',
      role: 'Mobile Doador',
      description: 'Página de agradecimento imediato integrada com gatilho comportamental. Exibe o Hero Card "Posso ajudar todo mês!" oferecendo Ativar Pix Automático ou Manter doação única.',
      targetStory: 'US-03',
      acceptance: 'Convite claro na confirmação (Hero card natural); bifurcação clara de escolha.',
      sentiment: 'Motivado ("Posso ajudar todo mês!")',
      actionHint: 'Acessar tela no app: Concluir doação pontual',
    },
    {
      id: 'D5',
      code: 'D5',
      title: 'Configuração do Pix Automático',
      role: 'Mobile Doador',
      description: 'Passo guiado com resumo transparente antes de autorizar: Favorecido Instituto Ebenézer, CNPJ, valor mensal e agendamento todo dia 5 no banco do usuário.',
      targetStory: 'US-03',
      acceptance: 'Resumo completo antes de autorizar; instrução clara de débito agendado no dia 5.',
      sentiment: 'Aliviado ("Nunca mais vou esquecer")',
      actionHint: 'Acessar tela no app: Clicar em "Ativar Pix Automático" na confirmação',
    },
    {
      id: 'D6',
      code: 'D6',
      title: 'Recorrência Ativa & Painel do Doador',
      role: 'Mobile Doador',
      description: 'Área do doador com status ativo, opção de cancelamento visível em menos de 3 segundos e resumo do impacto acumulado ("Você já doou R$ X no total").',
      targetStory: 'US-03',
      acceptance: 'Status ativo com cancelamento visível (< 3s); resumo de doações acumuladas.',
      sentiment: 'Empoderado ("Tenho controle total")',
      actionHint: 'Acessar tela no app: Aba "Área do Doador"',
    },
    {
      id: 'D7',
      code: 'D7',
      title: 'Portal de Prestação de Contas',
      role: 'Mobile Doador',
      description: 'Prestações consolidadas mensais com indicadores de fontes auditadas no cofre e seção obrigatória e elogiada: "O que ainda não conseguimos medir".',
      targetStory: 'US-04',
      acceptance: 'Indicadores com fonte citada; indicador de o que não sabemos medir; linguagem acessível.',
      sentiment: 'Conectado ("Sei exatamente onde foi")',
      actionHint: 'Acessar tela no app: Aba "Transparência"',
    },
  ];

  // Dados das Telas de Coordenação (Desktop O1 - O6)
  const coordScreens: ScreenItem[] = [
    {
      id: 'O1',
      code: 'O1',
      title: 'Painel Geral de Captação',
      role: 'Desktop Coordenação',
      description: 'Visão executiva com métricas consolidadas de Setembro/2026, gráfico empilhado Abr-Set, KPIs de receita recorrente vs pontual e cards de atenção operacional.',
      targetStory: 'US-05',
      acceptance: 'Dashboard com KPIs em tempo real; visão empilhada de histórico de receita.',
    },
    {
      id: 'O2',
      code: 'O2',
      title: 'Base de Doadores',
      role: 'Desktop Coordenação',
      description: 'Gestão de 87 doadores com filtros avançados: Todos, Recorrentes, Pontuais e Prontos para convite (12 doadores), além de busca e exportação CSV.',
      targetStory: 'US-05',
      acceptance: 'Tabela de doadores com filtros de propensão e exportação em conformidade LGPD.',
    },
    {
      id: 'O3',
      code: 'O3',
      title: 'Ficha Individual do Doador',
      role: 'Desktop Coordenação',
      description: 'Perfil completo (ex: Regina M.) com histórico de transações, linha do tempo, base legal LGPD, solicitação de anonimização (Art. 18) e disparo/preview de convite de recorrência no Design System.',
      targetStory: 'US-05',
      acceptance: 'Ficha individual detalhada com trilha de auditoria e modal de e-mail padronizado.',
    },
    {
      id: 'O4',
      code: 'O4',
      title: 'Cofre de Números (Maker-Checker)',
      role: 'Desktop Coordenação',
      description: 'Segurança contra desinformação: qualquer indicador de impacto exige aprovação dupla (Maker cadastra, Checker aprova) e exibe divergências detectadas.',
      targetStory: 'US-05',
      acceptance: 'Cofre de números com registro de divergências e bloqueio de publicação unilateral.',
    },
    {
      id: 'O5',
      code: 'O5',
      title: 'Prestação de Contas & Conciliação',
      role: 'Desktop Coordenação',
      description: 'Conciliação bancária automatizada, gestão de exceções financeiras justificadas e compositor de relatórios de transparência.',
      targetStory: 'US-05',
      acceptance: 'Compositor de relatório com bloqueio de dados não confirmados e conciliação bancária.',
    },
    {
      id: 'O6',
      code: 'O6',
      title: 'Régua de Contatos Automatizada',
      role: 'Desktop Coordenação',
      description: 'Automação D+0 a D+30 com indicador de economia de ~30 minutos diários da coordenadora Cláudia S., histórico de taxas de conversão e modelos de e-mail/WhatsApp no Design System.',
      targetStory: 'US-05',
      acceptance: 'Régua de relacionamento com indicador de tempo operacional (~30 min/dia poupados).',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Top Banner Acadêmico */}
      <div className="bg-gradient-to-r from-[#082f25] via-[#0b5344] to-[#12382e] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/20 text-emerald-200 rounded-full text-xs font-semibold backdrop-blur-sm border border-emerald-400/30">
            <Layers className="w-4 h-4 text-emerald-300" />
            <span>Documentação Acadêmica & Engenharia de UX • Instituto Ebenézer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Mapeamento UX, Jornadas & Personas
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            Consolidação completa dos 4 entregáveis acadêmicos: fluxo de navegação integrado (D1–D7 Mobile × O1–O6 Desktop), comparativo de jornada AS-IS vs TO-BE, personas do projeto e validação SUS 82 com usuário.
          </p>
        </div>
      </div>

      {/* Seletor de Abas Principais */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('fluxo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'fluxo'
              ? 'bg-[#082f25] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span>Fluxo Integrado (D1-D7 × O1-O6)</span>
        </button>

        <button
          onClick={() => setActiveSection('jornada')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'jornada'
              ? 'bg-[#082f25] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Jornada do Doador (AS-IS vs TO-BE)</span>
        </button>

        <button
          onClick={() => setActiveSection('personas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'personas'
              ? 'bg-[#082f25] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4 text-emerald-400" />
          <span>Personas (Regina M. & Cláudia S.)</span>
        </button>

        <button
          onClick={() => setActiveSection('validacao')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'validacao'
              ? 'bg-[#082f25] text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>User Stories & Validação SUS 82</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 1: FLUXO DE NAVEGAÇÃO E INTEGRAÇÃO (D1-D7 x O1-O6) */}
      {/* ========================================================================= */}
      {activeSection === 'fluxo' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header da Seção */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
                Entregável Acadêmico • Arquitetura de Informação
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Mapeamento do Fluxo Mobile Doador (D1–D7) × Retaguarda Desktop (O1–O6)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique nos passos abaixo para inspecionar os requisitos de cada tela e os pontos de integração entre doador e coordenação.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Doador (Mobile)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-slate-900"></span> Coordenação (Desktop)
              </span>
            </div>
          </div>

          {/* Pipeline Visual Doador (D1 a D7) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Jornada do Doador no Celular (D1 a D7)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {donorScreens.map((s, idx) => {
                const isSelected = selectedScreen === s.code;
                return (
                  <button
                    key={s.code}
                    onClick={() => setSelectedScreen(s.code)}
                    className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between h-36 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                          {s.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Passo {idx + 1}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                        {s.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold truncate block">
                      {s.targetStory}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destaque do Ponto Crítico D4 -> D5 -> D6 vs D4 -> Agora Não */}
          <div className="bg-gradient-to-r from-emerald-950 to-teal-950 rounded-2xl p-6 text-white border border-emerald-500/30 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Ponto de Decisão Estratégico (Tela D4)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/15 space-y-2">
                <span className="text-[11px] font-bold text-emerald-300 block uppercase">
                  Opção A: "Posso ajudar todo mês!" (Aceita Recorrência)
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Avança para <strong>D5 (Ativação Pix Automático)</strong> com resumo e débito agendado todo dia 5 do mês, culminando em <strong>D6 (Recorrência Ativa)</strong> no Painel do Doador com opção visível de cancelamento em &lt; 3s.
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 border border-white/15 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 block uppercase">
                  Opção B: "Agora não, manter doação única"
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Segue como doador pontual confirmado. O sistema registra o evento e agenda o <strong>Toque 3 da Régua de Contatos (D+21)</strong> da coordenadora Cláudia S., qualificando-o na lista de <em>Prontos para convite [12]</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Retaguarda Coordenação (O1 a O6) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-800" />
              <span>Retaguarda da Coordenação no Desktop (O1 a O6)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {coordScreens.map((s, idx) => {
                const isSelected = selectedScreen === s.code;
                return (
                  <button
                    key={s.code}
                    onClick={() => setSelectedScreen(s.code)}
                    className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-100 shadow-md ring-2 ring-slate-900/30'
                        : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                          {s.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Módulo {idx + 1}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                        {s.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-600 font-semibold truncate block">
                      {s.targetStory}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel de Detalhes da Tela Selecionada */}
          {(() => {
            const screen = [...donorScreens, ...coordScreens].find((s) => s.code === selectedScreen);
            if (!screen) return null;
            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-base font-black px-3 py-1 rounded-xl text-white ${
                      screen.code.startsWith('D') ? 'bg-emerald-600' : 'bg-slate-900'
                    }`}>
                      {screen.code}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{screen.title}</h3>
                      <span className="text-xs text-slate-400 font-medium">{screen.role}</span>
                    </div>
                  </div>

                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border border-slate-200">
                    História de Usuário: {screen.targetStory}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div>
                      <strong className="text-slate-700 block mb-1">Descrição Funcional & Requisitos:</strong>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {screen.description}
                      </p>
                    </div>

                    <div>
                      <strong className="text-slate-700 block mb-1">Critérios de Aceite Atendidos:</strong>
                      <div className="bg-emerald-50 text-emerald-900 p-3.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{screen.acceptance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {screen.sentiment && (
                      <div>
                        <strong className="text-slate-700 block mb-1">Sentimento do Doador no Passo:</strong>
                        <div className="bg-teal-50 text-teal-900 p-3.5 rounded-xl border border-teal-100 font-medium">
                          {screen.sentiment}
                        </div>
                      </div>
                    )}

                    {screen.actionHint && (
                      <div>
                        <strong className="text-slate-700 block mb-1">Onde testar no sistema:</strong>
                        <div className="bg-slate-50 text-slate-700 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span>{screen.actionHint}</span>
                          {onNavigateToTab && (
                            <button
                              onClick={() => {
                                if (screen.code === 'D1' || screen.code === 'D2' || screen.code === 'D3' || screen.code === 'D4' || screen.code === 'D5') {
                                  onNavigateToTab('checkout');
                                } else if (screen.code === 'D6') {
                                  onNavigateToTab('donor');
                                } else if (screen.code === 'D7') {
                                  onNavigateToTab('transparency');
                                }
                              }}
                              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <span>Ir para tela</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 2: JORNADA DO DOADOR (AS-IS vs TO-BE) */}
      {/* ========================================================================= */}
      {activeSection === 'jornada' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
              Entregável Acadêmico • UX Journey Mapping
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Jornada Comparativa: AS-IS (Cenário Atual sem Sistema) vs TO-BE (Com Ebenézer Recorrente)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidenciação dos pontos de dor superados e dos ganhos gerados para o vínculo e retenção do apoiador.
            </p>
          </div>

          {/* Quadro AS-IS (Cenário de Fricção) */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-rose-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                  AS-IS
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Jornada Atual (AS-IS) — Sem o Sistema</h3>
                  <p className="text-xs text-rose-700">Como a doação acontecia antes: atrito, desconfiança e abandono.</p>
                </div>
              </div>
              <Frown className="w-6 h-6 text-rose-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: '1', title: '1. Descoberta', desc: 'Vê post no Instagram sobre o Instituto', quote: '"Parece um trabalho sério"', feel: 'Curioso', icon: <Eye className="w-4 h-4 text-slate-400" /> },
                { step: '2', title: '2. Decisão', desc: 'Pede o Pix no direct ou WhatsApp', quote: '"Será que é confiável?"', feel: 'Inseguro', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
                { step: '3', title: '3. Pagamento', desc: 'Faz Pix manual avulso no app', quote: '"Pronto, fiz minha parte"', feel: 'Satisfeito', icon: <Meh className="w-4 h-4 text-slate-400" /> },
                { step: '4', title: '4. Pós-doação', desc: 'Não recebe retorno ou prestação', quote: '"Será que usaram meu dinheiro bem?"', feel: 'Desconfiado', icon: <Frown className="w-4 h-4 text-rose-500" /> },
                { step: '5', title: '5. Mês seguinte', desc: 'Esquece de doar novamente', quote: '"Ah, esse mês não lembrei"', feel: 'Indiferente', icon: <Frown className="w-4 h-4 text-slate-400" /> },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                      Etapa {item.step}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-0.5">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] italic text-rose-700 font-medium">{item.quote}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 mt-1 inline-block">
                      {item.feel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <strong className="text-rose-800 font-bold uppercase tracking-wider text-[11px]">
                Pontos de Dor Mapeados (Pain Points):
              </strong>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold text-[11px]">Sem recibo fiscal</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold text-[11px]">Sem recorrência automática</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold text-[11px]">Sem prestação de contas</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold text-[11px]">Vínculo se perde rapidamente</span>
              </div>
            </div>
          </div>

          {/* Quadro TO-BE (Cenário com Ebenézer Recorrente) */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                  TO-BE
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Jornada Futura (TO-BE) — Ebenézer Recorrente</h3>
                  <p className="text-xs text-emerald-800">A experiência desenhada: transparência radical, automação e vínculo perene.</p>
                </div>
              </div>
              <Smile className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { step: 'D1', title: '1. Landing', desc: 'Acessa página de doação', quote: '"Visual limpo, confio"', feel: 'Confiante' },
                { step: 'D2', title: '2. Identificação', desc: 'Nome e e-mail ou doação anônima', quote: '"Simples e rápido"', feel: 'Confortável' },
                { step: 'D3', title: '3. Pix', desc: 'Gera QR Code e paga instantaneamente', quote: '"Fácil, sem burocracia"', feel: 'Satisfeito' },
                { step: 'D4', title: '4. Confirmação', desc: 'Vê confirmação + convite à recorrência', quote: '"Posso ajudar todo mês!"', feel: 'Motivado' },
                { step: 'D5', title: '5. Ativação', desc: 'Ativa Pix Automático para dia 5', quote: '"Nunca mais vou esquecer"', feel: 'Aliviado' },
                { step: 'D6', title: '6. Recorrência', desc: 'Status ativo com cancelamento em < 3s', quote: '"Tenho controle total"', feel: 'Empoderado' },
                { step: 'D7', title: '7. Prestação', desc: 'Recebe relatório mensal auditado', quote: '"Sei exatamente onde foi"', feel: 'Conectado' },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-sm space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {item.step}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-0.5">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] italic text-emerald-800 font-medium">{item.quote}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1 inline-block">
                      {item.feel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <strong className="text-emerald-900 font-bold uppercase tracking-wider text-[11px]">
                Ganhos Estratégicos do Sistema (Gains):
              </strong>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px]">✨ Transparência total</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px]">🌱 Doação sem esforço</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px]">📊 Prestação de contas honesta</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px]">🤝 Vínculo duradouro</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 3: PERSONAS DO PROJETO (Regina M. e Cláudia S.) */}
      {/* ========================================================================= */}
      {activeSection === 'personas' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
              Entregável Acadêmico • Design de Interface & UX
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Personas do Projeto: Usuários que Ditam os Fluxos do Ebenézer Recorrente
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mapeamento de perfis desenvolvido através de pesquisa de campo e dados sintéticos orientados ao Jardim Ângela (SP).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Persona Primária: Regina M. */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center shadow-inner">
                      RM
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        Persona Primária
                      </span>
                      <h3 className="text-xl font-black text-slate-900">Regina M.</h3>
                      <p className="text-xs text-slate-500 font-medium">Doadora Recorrente • 42 anos • São Paulo, SP</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Origem: Instagram
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl italic text-xs text-emerald-950 font-medium">
                  "Eu doo porque acredito, mas preciso saber que o dinheiro chegou onde deveria."
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs">Ocupação & Contexto:</strong>
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      Analista Administrativa. Conheceu o Instituto Ebenézer por posts nas redes sociais e busca apoiar causas sociais regularmente.
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs">Motivações:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      <li>Contribuir com causas sociais de forma regular e sem burocracia.</li>
                      <li>Valoriza a transparência no uso dos recursos.</li>
                      <li>Busca sentir que sua doação faz diferença real na ponta.</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-rose-800 block mb-1 text-xs">Frustrações:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-rose-700">
                      <li>Não sabe se a doação anterior foi usada corretamente.</li>
                      <li>Esquece frequentemente de realizar a doação manual nos meses seguintes.</li>
                      <li>Desconfia de organizações que não prestam contas de forma acessível.</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-emerald-800 block mb-1 text-xs">Objetivos com o Produto:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-emerald-900 font-medium">
                      <li>Doar mensalmente via Pix Automático de maneira nativa sem precisar se lembrar ativamente.</li>
                      <li>Receber prestação de contas clara, visual e honesta.</li>
                      <li>Construir um vínculo de pertencimento com o projeto social.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Ponto focal nos fluxos D1 a D7 (Mobile).
              </div>
            </div>

            {/* Persona Secundária: Cláudia S. */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#082f25] text-white font-black text-xl flex items-center justify-center shadow-inner">
                      CS
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                        Persona Secundária
                      </span>
                      <h3 className="text-xl font-black text-slate-900">Cláudia S.</h3>
                      <p className="text-xs text-slate-500 font-medium">Coordenação do Instituto • 35 anos • Jd. Ângela, SP</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Origem: Canal Interno
                  </span>
                </div>

                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl italic text-xs text-slate-800 font-medium">
                  "Preciso parar de gastar 30 minutos por dia só pra saber quanto entrou."
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs">Ocupação & Contexto:</strong>
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      Coordenadora de Projetos no Instituto Ebenézer. Responsável por conciliação bancária, prestação de contas aos conselhos e comunicação com doadores.
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-800 block mb-1 text-xs">Motivações:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      <li>Garantir a sustentabilidade financeira do projeto de forma previsível.</li>
                      <li>Estruturar uma relação duradoura e baseada em transparência extrema com doadores.</li>
                      <li>Usar dados operacionais para tomadas de decisão estratégicas.</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-rose-800 block mb-1 text-xs">Frustrações:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-rose-700">
                      <li>Gerenciamento excessivo em planilhas manuais com alto índice de divergência.</li>
                      <li>Horas diárias desperdiçadas na conciliação bancária.</li>
                      <li>Dificuldade crônica para estruturar relatórios de impacto periódicos para os doadores.</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-emerald-800 block mb-1 text-xs">Objetivos com o Produto:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-900 font-medium">
                      <li>Acompanhar a saúde financeira e a base de apoiadores em um painel consolidado em tempo real.</li>
                      <li>Exportar e enviar prestações de contas simplificadas com dados automáticos.</li>
                      <li>Otimizar réguas de relacionamento digitais (economizando 30 min/dia).</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Ponto focal nos módulos O1 a O6 (Desktop).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 4: USER STORIES & REGISTRO DE VALIDAÇÃO COM USUÁRIO (SUS 82) */}
      {/* ========================================================================= */}
      {activeSection === 'validacao' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
              Entregável Acadêmico • Validação Empírica & Requisitos
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              User Stories Mapeadas & Registro de Validação com Usuário (SUS Score 82)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidação metodológica dos testes executados com perfil real compatível com a persona primária.
            </p>
          </div>

          {/* Destaque do SUS Score 82 */}
          <div className="bg-gradient-to-r from-[#082f25] to-[#0b5344] text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
                <Award className="w-4 h-4 text-emerald-300" />
                <span>Escala SUS (System Usability Scale)</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                SUS Score: 82 / 100 — Classificação "Excelente"
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Resultado obtido em teste moderado com protocolo think-aloud de 25 minutos via Google Meet, superando com folga a média padrão de usabilidade de mercado (68 pontos).
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[190px] shrink-0">
              <span className="text-4xl font-black text-white block">82</span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mt-1">
                Excelente (A+)
              </span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5">Média de mercado: 68</span>
            </div>
          </div>

          {/* Matriz das 5 User Stories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>5 Histórias de Usuário Implementadas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'US-01',
                  telas: 'D1 — Landing de Doação',
                  as: 'Como doador(a)',
                  want: 'escolher o valor e a frequência da minha doação',
                  soThat: 'para que eu contribua conforme minha possibilidade financeira.',
                  criteria: 'Valores sugeridos (R$ 25, R$ 50, R$ 100) visíveis; opção de valor personalizado; toggle mensal / único.',
                },
                {
                  id: 'US-02',
                  telas: 'D2 → D3 — Identificação e Pagamento',
                  as: 'Como doador(a)',
                  want: 'pagar via Pix com QR code ou código copia-e-cola',
                  soThat: 'para concluir a doação sem cadastro bancário.',
                  criteria: 'QR code gerado; campo copiável; countdown de 30 min; botão de confirmação; opção "Doar sem se identificar".',
                },
                {
                  id: 'US-03',
                  telas: 'D4 → D5 → D6 — Confirmação e Ativação',
                  as: 'Como doador(a)',
                  want: 'ativar doação recorrente via Pix Automático',
                  soThat: 'para não precisar lembrar de doar todo mês.',
                  criteria: 'Convite claro na confirmação (Hero card); resumo antes de autorizar; status ativo com opção visível de cancelamento em < 3s.',
                },
                {
                  id: 'US-04',
                  telas: 'D7 — Prestação de Contas',
                  as: 'Como doador(a)',
                  want: 'receber uma prestação de contas mensal transparente',
                  soThat: 'para saber como minha doação foi usada.',
                  criteria: 'Indicadores com fonte citada; indicador de "o que ainda não conseguimos medir" presente; linguagem acessível.',
                },
              ].map((us) => (
                <div key={us.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                      {us.id}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{us.telas}</span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                    <p><strong>{us.as}</strong>, quero <strong>{us.want}</strong> {us.soThat}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Critérios de Aceite Homologados:</strong>
                    <span>{us.criteria}</span>
                  </div>
                </div>
              ))}

              {/* US-05 Coordenação */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 md:col-span-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                    US-05
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">O1 → O2 → O3 → O4 → O5 → O6</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                  <p>
                    <strong>Como coordenadora</strong>, quero visualizar a receita, a base de doadores e montar a prestação de contas em um painel para gerir o projeto com dados verificados.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <strong className="text-slate-800 block mb-0.5">Critérios de Aceite Homologados:</strong>
                  <span>Dashboard com KPIs; tabela de doadores com filtros; ficha individual; cofre de números com divergências; compositor de relatório com bloqueio de dados não confirmados; régua de relacionamento com indicador de tempo operacional (~30 min/dia).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roteiro e Feedbacks do Teste de Usabilidade */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Aprendizados e Feedbacks Registrados no Teste com Usuário
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <strong className="text-emerald-900 font-bold block">1. Sucesso de Tarefa:</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  O participante completou todas as 5 tarefas propostas no roteiro sem nenhuma assistência ou hesitação grave.
                </p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <strong className="text-emerald-900 font-bold block">2. Posicionamento Natural:</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  O convite à recorrência em D4 foi percebido como "natural, não forçado", validando a decisão de implementá-lo como Hero Card.
                </p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <strong className="text-emerald-900 font-bold block">3. Transparência Apreciada:</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  A seção "O que ainda não conseguimos medir" em D7 gerou forte impacto: <em>"É honesto. Nunca vi uma ONG falar o que não sabe."</em>
                </p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <strong className="text-emerald-900 font-bold block">4. Cancelamento Claro:</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  O botão de cancelamento em D6 foi localizado em menos de 3 segundos, confirmando a decisão de deixá-lo visível sem barreiras.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <strong className="text-slate-800 font-bold block">
                Melhoria Futura Atendida no Roadmap:
              </strong>
              <p className="text-[11px] leading-relaxed">
                Sugestão recebida no teste: <em>"Adicionar um resumo do impacto acumulado na tela D6 ('Você já doou R$ X no total')"</em>.
                Esta funcionalidade foi 100% incorporada tanto na tela D6 de confirmação quanto no Portal do Doador autenticado!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

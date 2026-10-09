import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Award, FileCheck2, Info, RefreshCw, HeartHandshake, Compass, FileDown, CheckCircle2 } from 'lucide-react';
import { generateTransparencyPdf } from './generateTransparencyPdf';

export const TransparencyPage: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    try {
      setGeneratingPdf(true);
      await new Promise((resolve) => setTimeout(resolve, 350));
      generateTransparencyPdf(indicators);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4500);
    } catch (err) {
      console.error('Erro ao gerar relatório em PDF:', err);
      alert('Não foi possível gerar o relatório em PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const loadIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPublicIndicators();
      setIndicators(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar indicadores de transparência.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndicators();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Banner de Apresentação da Prestação de Contas */}
      <div className="bg-[#101625] rounded-[28px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FB00]/15 text-[#00FB00] rounded-full text-xs font-bold backdrop-blur-sm border border-[#00FB00]/30">
            <ShieldCheck className="w-4 h-4 text-[#00FB00]" />
            <span>Transparência Pública e Governança Assistencial (RF-009)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Prestação de Contas & Impacto Verificável
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Cada real doado ao Instituto de Cultura e Lazer Ebenézer é transformado em nutrição balanceada, apoio socioeducativo e acolhimento familiar.
            Nossos números são homologados através do <strong>Cofre de Indicadores</strong> com dupla aprovação
            (Maker-Checker) e auditoria de fontes reais.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf || loading}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#006400] hover:bg-[#005000] active:scale-[0.98] text-white rounded-[300px] font-bold text-sm shadow-xl hover:shadow-2xl transition-all border border-[#00FB00]/30 disabled:opacity-50 cursor-pointer"
            >
              {generatingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#00FB00]" />
              ) : (
                <FileDown className="w-4 h-4 text-[#00FB00]" />
              )}
              <span>{generatingPdf ? 'Gerando Relatório...' : 'Extrair Relatório em PDF'}</span>
            </button>

            {pdfSuccess && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FB00]/20 text-[#00FB00] border border-[#00FB00]/40 rounded-full text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Relatório PDF baixado com sucesso!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aviso de Privacidade e Proteção de Crianças e Famílias */}
      <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-[#2C394C]">
        <Info className="w-5 h-5 text-[#006400] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm text-[#101625] mb-0.5">
            Proteção Integral da Privacidade e dos Beneficiários (LGPD Art. 14)
          </strong>
          Em conformidade com a Constituição do Instituto e as diretrizes do PRD,
          <strong> nenhum dado pessoal, lista nominal ou imagem identificável de crianças e famílias acolhidas é divulgado publicamente</strong>.
          As evidências de compras e presenças são auditadas internamente no cofre institucional fechado.
        </div>
      </div>

      {/* Grid de Indicadores de Impacto */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-[#101625] flex items-center gap-2">
              <Award className="w-6 h-6 text-[#006400]" />
              <span>Indicadores de Impacto Social Homologados</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Valores acumulados e verificados pelo conselho fiscal e coordenação pedagógica.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf || loading}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#006400] hover:bg-[#005000] py-2 px-4 rounded-[300px] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              title="Baixar relatório em PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[#00FB00]" />
              <span>{generatingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>
            <button
              onClick={loadIndicators}
              className="flex items-center gap-1.5 text-xs font-bold text-[#101625] bg-[#EFF3F8] hover:bg-slate-200 border border-slate-200 py-2 px-4 rounded-[300px] shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Carregando indicadores auditados...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indicators.map((ind) => (
              <div
                key={ind.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-full border border-emerald-100">
                      {ind.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      v{ind.version} • {ind.period}
                    </span>
                  </div>

                  <div className="mt-2 mb-4">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      {ind.metricValue.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 ml-1.5 block mt-0.5">
                      {ind.metricUnit}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm mb-2">{ind.name}</h3>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Fonte Verificada:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      {ind.sourceDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aprovado no Cofre</span>
                  </span>
                  <span>{new Date(ind.publishedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO OBRIGATÓRIA US-04: O QUE AINDA NÃO CONSEGUIMOS MEDIR (Honestidade Radical & Governança D7) */}
      <div className="bg-[#101625] text-white rounded-[28px] p-8 md:p-10 shadow-2xl space-y-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FB00]/15 text-[#00FB00] rounded-full text-xs font-bold border border-[#00FB00]/30">
              <Compass className="w-4 h-4 text-[#00FB00]" />
              <span>Transparência Radical & Compromisso Ético • D7</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              O que ainda não conseguimos medir
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Prestar contas não é apenas mostrar vitórias: é ter a integridade ética de declarar publicamente quais impactos sociais ainda não temos metodologia estatística ou orçamento para mensurar com precisão científica.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[200px] shrink-0">
            <span className="text-[11px] text-[#00FB00] font-bold block uppercase tracking-wider">
              Feedback dos Doadores
            </span>
            <span className="text-xs text-slate-300 block mt-1 italic">
              "É honesto. Nunca vi uma ONG falar abertamente o que não sabe."
            </span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              — Teste de Usabilidade SUS 82
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:bg-white/10 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#00FB00]/20 border border-[#00FB00]/40 flex items-center justify-center text-[#00FB00] font-black text-sm">
                01
              </div>
              <h3 className="font-bold text-white text-sm">
                Impacto Longitudinal Pós-Egresso (3 a 5 anos)
              </h3>
              <div className="text-[11px] space-y-2 text-slate-300">
                <p>
                  <strong className="text-[#00FB00] block">O que gostaríamos de aferir:</strong>
                  Qual a progressão de renda média e taxa de ingresso no ensino superior dos jovens atendidos 5 anos após concluírem as oficinas no Ebenézer?
                </p>
                <p>
                  <strong className="text-slate-400 block">Por que não medimos hoje:</strong>
                  O rastreamento contínuo de egressos em comunidades vulneráveis exige equipe dedicada de busca ativa e infraestrutura de dados além da nossa capacidade orçamentária atual.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] text-[#00FB00] font-medium">
              🌱 Em estudo: Parceria acadêmica para coorte amostral em 2027.
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:bg-white/10 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#00FB00]/20 border border-[#00FB00]/40 flex items-center justify-center text-[#00FB00] font-black text-sm">
                02
              </div>
              <h3 className="font-bold text-white text-sm">
                Efeito Multiplicador Intrafamiliar Exato
              </h3>
              <div className="text-[11px] space-y-2 text-slate-300">
                <p>
                  <strong className="text-[#00FB00] block">O que gostaríamos de aferir:</strong>
                  Como as 380 refeições diárias e as cestas de alimentos impactam a saúde nutricional de avós e outros responsáveis que moram na mesma casa?
                </p>
                <p>
                  <strong className="text-slate-400 block">Por que não medimos hoje:</strong>
                  Aferir dados biométricos de membros da família não cadastrados violaria o princípio de minimização da LGPD e a privacidade dos lares.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] text-[#00FB00] font-medium">
              🌱 Em estudo: Questionários semestrais qualitativos não invasivos.
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:bg-white/10 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#00FB00]/20 border border-[#00FB00]/40 flex items-center justify-center text-[#00FB00] font-black text-sm">
                03
              </div>
              <h3 className="font-bold text-white text-sm">
                Isolamento Causal Estrito na Evasão Escolar
              </h3>
              <div className="text-[11px] space-y-2 text-slate-300">
                <p>
                  <strong className="text-[#00FB00] block">O que gostaríamos de aferir:</strong>
                  Dos 94% de retenção escolar, qual fração exata é decorrente exclusivamente do nosso reforço versus políticas públicas municipais?
                </p>
                <p>
                  <strong className="text-slate-400 block">Por que não medimos hoje:</strong>
                  Exigiria grupo de controle randomizado (deixar famílias vulneráveis sem atendimento), o que contraria totalmente nosso princípio ético humanitário.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] text-[#00FB00] font-medium">
              🌱 Posição: Utilizamos dados agregados das escolas estaduais locais como estimativa conservadora.
            </div>
          </div>
        </div>
      </div>

      {/* Card Informativo sobre Destinação dos Recursos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-slate-800 text-base">Como sua doação é monitorada</h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Cada doação recebida gera um lançamento contábil imutável segregado por campanha. Nossos relatórios são
            reconciliados diretamente com o extrato bancário do parceiro financeiro, garantindo que 100% dos recursos sejam
            direcionados às causas sociais sem desvios.
          </p>
        </div>
      </div>
    </div>
  );
};

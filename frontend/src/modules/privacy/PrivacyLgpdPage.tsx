import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  HeartHandshake,
  FileText,
  Mail,
  CheckCircle2,
  ExternalLink,
  Info,
  Building2,
  Scale,
  RefreshCw,
  ArrowLeft,
  Heart
} from 'lucide-react';

interface PrivacyLgpdPageProps {
  onNavigateToTab?: (tab: 'checkout' | 'transparency' | 'donor') => void;
}

export const PrivacyLgpdPage: React.FC<PrivacyLgpdPageProps> = ({ onNavigateToTab }) => {
  const [activeSection, setActiveSection] = useState<string>('todos');

  const sections = [
    { id: 'todos', label: 'Visão Completa' },
    { id: 'coleta', label: 'Dados Coletados' },
    { id: 'criancas', label: 'Proteção de Crianças (Art. 14)' },
    { id: 'pagamentos', label: 'Segurança & Meios de Pagamento' },
    { id: 'direitos', label: 'Seus Direitos (Art. 18)' },
    { id: 'dpo', label: 'Canal do DPO' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 font-montserrat">
      {/* Botão Voltar Rápido */}
      {onNavigateToTab && (
        <div>
          <button
            onClick={() => onNavigateToTab('checkout')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2C394C] hover:text-[#101625] bg-white border border-slate-200 px-4 py-2 rounded-[300px] shadow-xs transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#006400]" />
            <span>Voltar ao Portal de Doação</span>
          </button>
        </div>
      )}

      {/* Banner Principal - Design System Oficial Ebenézer */}
      <div className="bg-[#101625] rounded-[28px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00FB00]/15 text-[#00FB00] rounded-full text-xs font-bold backdrop-blur-sm border border-[#00FB00]/30">
            <ShieldCheck className="w-4 h-4 text-[#00FB00]" />
            <span>Conformidade Estrita com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Política de Privacidade & Governança de Dados
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            No <strong>Instituto de Cultura e Lazer Ebenézer</strong>, a proteção da sua privacidade e a segurança das crianças, jovens e famílias acolhidas no Jardim Ângela são princípios fundamentais e inegociáveis.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-[#00FB00]" />
              <span>CNPJ: 30.434.044/0001-90</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              <Scale className="w-3.5 h-3.5 text-[#00FB00]" />
              <span>Marco Legal: LGPD + ECA + MROSC</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              <RefreshCw className="w-3.5 h-3.5 text-[#00FB00]" />
              <span>Última revisão: Outubro/2026</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navegação Rápida entre Seções (Pill Filter) */}
      <div className="flex flex-wrap gap-2 pb-1">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-4 py-2 rounded-[300px] text-xs font-bold transition-all shadow-xs ${
              activeSection === sec.id
                ? 'bg-[#101625] text-[#00FB00] ring-2 ring-[#00FB00]'
                : 'bg-white text-[#2C394C] hover:bg-[#EFF3F8] border border-slate-200'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO 1: Identificação do Controlador */}
      {(activeSection === 'todos' || activeSection === 'coleta') && (
        <section className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF3F8] text-[#101625] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-[#006400]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seção 01</span>
              <h2 className="text-xl font-black text-[#101625]">1. Identificação do Controlador de Dados</h2>
            </div>
          </div>

          <p className="text-xs text-[#2C394C] leading-relaxed">
            O responsável pelo tratamento dos dados pessoais coletados nesta plataforma é o:
          </p>

          <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#2C394C]">
            <div>
              <span className="text-slate-400 block font-medium">Razão Social:</span>
              <strong className="text-[#101625] text-sm">Instituto de Cultura e Lazer Ebenézer</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Cadastro Nacional de Pessoa Jurídica (CNPJ):</span>
              <strong className="text-[#101625] font-mono text-sm">30.434.044/0001-90</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Sede e Endereço Físico:</span>
              <span className="text-[#101625] font-medium">R. José Ribeiro Ramos, 31 - Jardim Ângela, São Paulo - SP, CEP 05878-110</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Encarregado pelo Tratamento de Dados (DPO):</span>
              <span className="text-[#101625] font-semibold">privacidade@institutosocialebenezer.com.br</span>
            </div>
          </div>
        </section>
      )}

      {/* CONTEÚDO 2: Minimização de Dados e Modo Anônimo */}
      {(activeSection === 'todos' || activeSection === 'coleta') && (
        <section className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF3F8] text-[#101625] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-[#006400]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seção 02</span>
              <h2 className="text-xl font-black text-[#101625]">2. Princípio da Minimização de Dados (Art. 6º, III)</h2>
            </div>
          </div>

          <p className="text-xs text-[#2C394C] leading-relaxed">
            Em estrita obediência ao artigo 6º, inciso III da LGPD, a plataforma Ebenézer coleta <strong>apenas e tão somente os dados estritamente indispensáveis</strong> para a efetivação da doação e cumprimento de obrigações legais:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-[#101625] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#006400]" />
                <span>Dados Mínimos do Doador</span>
              </div>
              <p className="text-[11px] text-[#2C394C] leading-relaxed">
                Solicitamos apenas <strong>Nome Completo</strong> e <strong>E-mail</strong> para entrega do comprovante de transação e recibo oficial. O telefone celular é opcional.
              </p>
            </div>

            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-[#101625] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#006400]" />
                <span>CPF Estritamente Opcional</span>
              </div>
              <p className="text-[11px] text-[#2C394C] leading-relaxed">
                O fornecimento de CPF <strong>nunca é obrigatório</strong> para doar. É solicitado unicamente se você optar explicitamente por emitir um recibo fiscal nominal identificado.
              </p>
            </div>

            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-[#101625] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#006400]" />
                <span>Modo de Doação Anônima (D2)</span>
              </div>
              <p className="text-[11px] text-[#2C394C] leading-relaxed">
                Disponibilizamos a opção de <strong>Doação Anônima</strong>: nenhum dado de nome ou documento é gravado em nossos servidores, sendo o apoio registrado de forma totalmente impessoal.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#006400] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-[#101625] block mb-0.5">Consentimento de Comunicação Livre e Transparente</strong>
              A caixa de seleção para recebimento de informativos institucionais é mantida <strong>desmarcada por padrão</strong> (sem opt-in induzido ou oculto). Você pode revogar essa permissão a qualquer momento com apenas 1 clique em sua Área do Doador.
            </div>
          </div>
        </section>
      )}

      {/* CONTEÚDO 3: Proteção de Crianças e Adolescentes (Art. 14 LGPD & ECA) */}
      {(activeSection === 'todos' || activeSection === 'criancas') && (
        <section className="bg-[#101625] text-white rounded-[28px] p-6 md:p-10 shadow-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#00FB00]/20 text-[#00FB00] flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#00FB00] uppercase tracking-wider block">Cláusula de Proteção Integral</span>
              <h2 className="text-xl md:text-2xl font-black text-white">3. Proteção Prioritária de Crianças e Beneficiários (Art. 14 da LGPD & ECA)</h2>
            </div>
          </div>

          <div className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
            <p>
              Em conformidade com o <strong>Artigo 14 da LGPD</strong> e o <strong>Estatuto da Criança e do Adolescente (ECA - Lei nº 8.069/1990)</strong>, o Instituto Ebenézer aplica regras de segurança máxima sobre o tratamento de dados de menores atendidos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="font-black text-white text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FB00]"></span>
                  <span>Vedação Absoluta de Exposição Pública</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Nenhum dado pessoal, lista nominal, endereço, imagem fotográfica ou vídeo identificável de crianças ou adolescentes</strong> é exposto publicamente na internet, redes sociais ou no Portal de Transparência.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="font-black text-white text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FB00]"></span>
                  <span>Cofre de Indicadores & Segregação Maker-Checker</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As evidências de compras de alimentos e listas de presença de oficinas são armazenadas exclusivamente em nosso <strong>Cofre Institucional Fechado</strong> com criptografia. Apenas indicadores consolidados e anonimizados são tornados públicos após dupla revisão por operador e diretoria.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONTEÚDO 4: Segurança em Pagamentos & Infraestrutura Bancária */}
      {(activeSection === 'todos' || activeSection === 'pagamentos') && (
        <section className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF3F8] text-[#101625] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-[#006400]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seção 04</span>
              <h2 className="text-xl font-black text-[#101625]">4. Segurança Bancária & Meios de Pagamento</h2>
            </div>
          </div>

          <p className="text-xs text-[#2C394C] leading-relaxed">
            Adotamos os padrões mais rigorosos do Sistema Financeiro Nacional para garantir que nenhuma transação financeira ou dado bancário seja interceptado ou manipulado:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-[#101625] text-xs flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#101625] text-[#00FB00] rounded-md font-mono text-[10px]">PIX</span>
                <span>Pix Bacen & Pix Automático Recorrente</span>
              </h3>
              <p className="text-[11px] text-[#2C394C] leading-relaxed">
                Todas as cobranças Pix são geradas com chave de idempotência e identificador universal sob os padrões oficiais do <strong>Banco Central do Brasil</strong>. As autorizações de Pix Automático são vinculadas exclusivamente à sua conta e podem ser pausadas a qualquer instante.
              </p>
            </div>

            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-[#101625] text-xs flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#101625] text-[#00FB00] rounded-md font-mono text-[10px]">PCI</span>
                <span>Cartões de Crédito & Criptografia 256 bits</span>
              </h3>
              <p className="text-[11px] text-[#2C394C] leading-relaxed">
                As doações com cartão de crédito são processadas através de gateway certificado <strong>PCI-DSS Nível 1</strong>. Os servidores do Instituto Ebenézer <strong>nunca armazenam o número completo do seu cartão ou o código de segurança (CVV)</strong>.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CONTEÚDO 5: Direitos do Titular de Dados (Art. 18 LGPD) */}
      {(activeSection === 'todos' || activeSection === 'direitos') && (
        <section className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF3F8] text-[#101625] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-[#006400]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seção 05</span>
              <h2 className="text-xl font-black text-[#101625]">5. Seus Direitos como Titular de Dados (Artigo 18 da LGPD)</h2>
            </div>
          </div>

          <p className="text-xs text-[#2C394C] leading-relaxed">
            Você é o único titular de seus dados pessoais. A qualquer momento, mediante requisição direta e facilitada, você tem direito a:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <strong className="text-[#101625] block font-bold">1. Confirmação e Acesso</strong>
              <p className="text-[11px] text-[#2C394C]">Saber se tratamos seus dados e consultar todo seu histórico de doações na Área do Doador.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <strong className="text-[#101625] block font-bold">2. Correção de Dados</strong>
              <p className="text-[11px] text-[#2C394C]">Solicitar a retificação de informações incompletas, inexatas ou desatualizadas.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <strong className="text-[#101625] block font-bold">3. Cancelamento sem Carência</strong>
              <p className="text-[11px] text-[#2C394C]">Interromper sua assinatura recorrente a qualquer momento em menos de 3 segundos com 1 clique.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <strong className="text-[#101625] block font-bold">4. Anonimização ou Bloqueio</strong>
              <p className="text-[11px] text-[#2C394C]">Pedir a anonimização de seus dados cadastrais, preservando apenas os registros fiscais legalmente obrigatórios.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <strong className="text-[#101625] block font-bold">5. Revogação de Consentimento</strong>
              <p className="text-[11px] text-[#2C394C]">Desativar a qualquer instante o recebimento de e-mails informativos sobre o Instituto.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
              <strong className="text-[#101625] block font-bold">6. Portabilidade</strong>
              <p className="text-[11px] text-[#2C394C]">Receber extrato digital estruturado de suas contribuições para fins de comprovação e declaração de renda.</p>
            </div>
          </div>

          {/* Card com Ação Direta para a Área do Doador */}
          <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-[#101625] text-sm">Exercer seus direitos agora mesmo</h4>
              <p className="text-xs text-[#2C394C] mt-0.5">
                Acesse sua Área do Doador com login seguro sem senha (código OTP de uso único por e-mail).
              </p>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('donor')}
                className="rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-3 px-6 text-xs transition-all shadow-sm hover:-translate-y-0.5 uppercase tracking-wide shrink-0"
              >
                Ir para Minha Área do Doador
              </button>
            )}
          </div>
        </section>
      )}

      {/* CONTEÚDO 6: Canal de Contato com o DPO / Encarregado */}
      {(activeSection === 'todos' || activeSection === 'dpo') && (
        <section className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF3F8] text-[#101625] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5 text-[#006400]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seção 06</span>
              <h2 className="text-xl font-black text-[#101625]">6. Canal Direto com o Encarregado de Dados (DPO)</h2>
            </div>
          </div>

          <p className="text-xs text-[#2C394C] leading-relaxed">
            Caso tenha qualquer dúvida, sugestão ou queira formalizar um pedido relativo aos seus dados pessoais e aos direitos previstos na LGPD, disponibilizamos canais dedicados e diretos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-semibold block">E-mail Oficial do Encarregado (DPO):</span>
              <a
                href="mailto:privacidade@institutosocialebenezer.com.br"
                className="text-sm font-black text-[#101625] hover:text-[#006400] underline block"
              >
                privacidade@institutosocialebenezer.com.br
              </a>
              <p className="text-[11px] text-slate-500">
                Prazo legal de resposta em até 15 (quinze) dias úteis nos termos do art. 19 da LGPD.
              </p>
            </div>

            <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-semibold block">Canal Ético e de Denúncias:</span>
              <a
                href="https://forms.gle/3EkchJz5exqvdbJq6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#101625] hover:text-[#006400] inline-flex items-center gap-1.5"
              >
                <span>Acessar Formulário de Denúncia Externa</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#006400]" />
              </a>
              <p className="text-[11px] text-slate-500">
                Garantia de anonimato absoluto e sigilo para apuração de inconformidades ou desvios éticos.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Rodapé Interno da Página com Chamada à Ação Solidária */}
      <div className="bg-[#EFF3F8] rounded-[24px] border border-slate-200 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-black text-[#101625] text-base">Transparência total para transformar vidas</h4>
          <p className="text-xs text-[#2C394C] mt-0.5">
            Ao doar para o Instituto Social Ebenézer, você ajuda dezenas de famílias com total segurança jurídica e ética.
          </p>
        </div>
        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('checkout')}
            className="rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-3.5 px-6 text-xs transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 uppercase tracking-wide shrink-0"
          >
            <Heart className="w-4 h-4 text-[#101625] fill-[#101625]" />
            <span>Fazer uma Doação Segura</span>
          </button>
        )}
      </div>
    </div>
  );
};

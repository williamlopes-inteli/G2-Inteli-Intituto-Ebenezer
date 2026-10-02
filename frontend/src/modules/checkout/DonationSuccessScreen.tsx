import React, { useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Mail,
  Repeat,
  CreditCard,
  QrCode,
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface DonationSuccessScreenProps {
  amount: number;
  paidAt?: string | null;
  paymentMethod?: string;
  frequency?: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  onReset: () => void;
  onNavigateToDonorPortal?: () => void;
  onNavigateToTransparency?: () => void;
}

export const DonationSuccessScreen: React.FC<DonationSuccessScreenProps> = ({
  amount,
  paidAt,
  paymentMethod,
  frequency,
  cardBrand,
  cardLast4,
  onReset,
  onNavigateToDonorPortal,
  onNavigateToTransparency,
}) => {
  const isInitiallyRecurring = frequency === 'MONTHLY';
  const [subStep, setSubStep] = useState<
    'D4_CONFIRMATION' | 'D5_ACTIVATE_PIX' | 'D6_RECURRING_ACTIVE' | 'ONE_TIME_KEPT'
  >(isInitiallyRecurring ? 'D6_RECURRING_ACTIVE' : 'D4_CONFIRMATION');

  const [cancelSuccess, setCancelSuccess] = useState<boolean>(false);

  const formattedDate = paidAt
    ? new Date(paidAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : 'Agora';

  // --- D5: Configuração Guiada de Pix Automático ---
  if (subStep === 'D5_ACTIVATE_PIX') {
    return (
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 max-w-xl mx-auto p-6 md:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#101625] text-[#00FB00] flex items-center justify-center font-black text-xs">
              D5
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                Passo Guiado de Ativação
              </span>
              <h2 className="text-lg font-black text-[#101625]">
                Ativar Pix Automático Recorrente
              </h2>
            </div>
          </div>
          <span className="text-[10px] bg-[#EFF3F8] text-[#101625] font-bold px-3 py-1 rounded-full border border-slate-200">
            Todo dia 5
          </span>
        </div>

        <div className="space-y-4 text-xs text-[#2C394C]">
          <p className="leading-relaxed">
            O Pix Automático é o meio oficial regulamentado pelo Banco Central que debita mensalmente sua contribuição sem necessidade de aprovação manual a cada mês.
          </p>

          {/* Resumo antes de autorizar (Critério de aceite US-03) */}
          <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-[#101625] text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006400]" />
              <span>Resumo dos Dados da Recorrência</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block font-medium">Favorecido Oficial:</span>
                <strong className="text-[#101625]">Inst. de Cultura e Lazer Ebenézer</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CNPJ Oficial:</span>
                <strong className="text-[#101625] font-mono">30.434.044/0001-90</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Valor Mensal:</span>
                <strong className="text-[#101625] text-sm font-black">R$ {amount.toFixed(2)}/mês</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Data de Débito:</span>
                <strong className="text-[#101625] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#006400]" />
                  Todo dia 05
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-[11px] text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sem burocracia e com cancelamento livre</span>
            </div>
            <p className="text-[#2C394C] leading-relaxed">
              Você pode pausar ou cancelar esta autorização a qualquer momento em menos de 3 segundos na sua Área do Doador ou pelo aplicativo do seu próprio banco.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => setSubStep('D6_RECURRING_ACTIVE')}
            className="w-full rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-4 px-6 shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
          >
            <span>Confirmar e Ativar Recorrência Mensal</span>
            <ArrowRight className="w-4 h-4 text-[#101625]" />
          </button>
          <button
            onClick={() => setSubStep('D4_CONFIRMATION')}
            className="w-full rounded-[300px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 text-xs transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // --- D6: Recorrência Ativa / Painel do Doador ---
  if (subStep === 'D6_RECURRING_ACTIVE') {
    return (
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 max-w-xl mx-auto p-6 md:p-8 space-y-6 animate-fade-in text-center">
        <div className="w-16 h-16 bg-[#101625] rounded-full flex items-center justify-center mx-auto text-[#00FB00] shadow-md">
          <Repeat className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF3F8] text-[#101625] text-xs font-bold uppercase tracking-wider border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006400]" />
            <span>Recorrência Ativa • Tela D6</span>
          </div>
          <h2 className="text-2xl font-black text-[#101625] tracking-tight">
            Parabéns! Sua Doação Mensal está Ativa!
          </h2>
          <p className="text-xs text-[#2C394C] max-w-md mx-auto">
            Sua contribuição mensal de <strong className="text-[#101625] font-bold">R$ {amount.toFixed(2)}</strong> está agendada para débito automático todo dia 5.
          </p>
        </div>

        {/* Resumo do Impacto Acumulado com Design Oficial Ebenézer */}
        <div className="bg-[#101625] text-white border border-slate-800 rounded-2xl p-5 text-left space-y-2 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FB00] block">
            Impacto Acumulado no Instituto Social Ebenézer
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              Você já doou R$ {amount.toFixed(2)} no total
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Esse valor já garantiu reforço alimentar balanceado e materiais para as oficinas socioeducativas no Jardim Ângela.
          </p>
        </div>

        {/* Opção de cancelamento visível em menos de 3 segundos (Critério de aceite US-03) */}
        <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#101625]">Gestão da Doação</span>
            <span className="text-[10px] font-bold text-[#101625] bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
              Ativo • Débito todo dia 05
            </span>
          </div>
          {cancelSuccess ? (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Assinatura cancelada com sucesso. Nenhuma cobrança futura será realizada.</span>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#2C394C]">
                Cancelamento imediato sem carência:
              </span>
              <button
                onClick={() => setCancelSuccess(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-all"
              >
                Cancelar Recorrência
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          {onNavigateToDonorPortal && (
            <button
              onClick={onNavigateToDonorPortal}
              className="flex-1 rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-3 px-4 text-xs transition-all shadow hover:-translate-y-0.5 flex items-center justify-center gap-1.5 uppercase tracking-wide"
            >
              <UserCheck className="w-4 h-4" />
              <span>Área do Doador</span>
            </button>
          )}
          {onNavigateToTransparency && (
            <button
              onClick={onNavigateToTransparency}
              className="flex-1 rounded-[300px] bg-white hover:bg-[#EFF3F8] text-[#101625] font-bold py-3 px-4 text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#006400]" />
              <span>Prestação de Contas (D7)</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="px-4 py-3 rounded-[300px] text-xs font-bold text-slate-500 hover:text-[#101625] hover:bg-slate-100 transition-all"
          >
            Início
          </button>
        </div>
      </div>
    );
  }

  // --- Caso o usuário opte por manter doação única ---
  if (subStep === 'ONE_TIME_KEPT') {
    return (
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 max-w-lg mx-auto p-8 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-[#101625] rounded-full flex items-center justify-center mx-auto text-[#00FB00] shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-[#EFF3F8] text-[#101625] text-[11px] font-bold uppercase tracking-wider border border-slate-200">
            Doação Única Confirmada
          </span>
          <h2 className="text-2xl font-black text-[#101625] tracking-tight">
            Muito Obrigado pelo seu Apoio!
          </h2>
          <p className="text-xs text-[#2C394C]">
            Sua contribuição avulsa de <strong className="text-[#101625]">R$ {amount.toFixed(2)}</strong> foi registrada com sucesso e apoiará diretamente as ações sociais do Instituto Ebenézer.
          </p>
        </div>

        <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-4 text-left text-xs text-[#2C394C] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#101625]">
            <Mail className="w-4 h-4 text-[#006400]" />
            <span>Régua de Comunicação e Transparência</span>
          </div>
          <p className="text-[11px] text-[#2C394C] leading-relaxed">
            Você receberá o comprovante oficial no seu e-mail e nosso boletim periódico com a prestação de contas dos projetos.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={onReset}
            className="w-full rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-4 px-4 shadow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
          >
            <Heart className="w-4 h-4 text-[#101625] fill-[#101625]" />
            <span>Fazer Outra Doação</span>
          </button>
        </div>
      </div>
    );
  }

  // --- D4 Padrão: Confirmação + Hero Card de Convite à Recorrência ---
  return (
    <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 max-w-lg mx-auto p-6 md:p-8 text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 bg-[#101625] rounded-full flex items-center justify-center mx-auto text-[#00FB00] shadow-md">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-[#101625] tracking-tight">
          Doação Confirmada com Sucesso!
        </h2>
        <p className="text-xs text-[#2C394C]">
          Sua contribuição pontual de <strong className="text-[#101625] font-black">R$ {amount.toFixed(2)}</strong> foi confirmada e creditada ao Instituto Ebenézer às {formattedDate}.
        </p>
      </div>

      {paymentMethod === 'CREDIT_CARD' && cardLast4 && (
        <div className="bg-[#EFF3F8] border border-slate-200 rounded-xl p-3 text-xs text-[#2C394C] flex items-center justify-center gap-2">
          <CreditCard className="w-4 h-4 text-[#101625]" />
          <span>Pago via Cartão de Crédito <strong>{cardBrand}</strong> final <strong>{cardLast4}</strong></span>
        </div>
      )}

      {paymentMethod === 'PIX' && (
        <div className="bg-[#EFF3F8] border border-slate-200 rounded-xl p-3 text-xs text-[#2C394C] flex items-center justify-center gap-2">
          <QrCode className="w-4 h-4 text-[#101625]" />
          <span>Pago via Pix instantâneo oficial</span>
        </div>
      )}

      {/* Hero Card de Convite à Recorrência (D4 -> "Posso ajudar todo mês!") */}
      <div className="bg-[#101625] text-white rounded-2xl p-6 text-left shadow-xl space-y-3.5 border border-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00FB00]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FB00]">
            Posso ajudar todo mês! (D4)
          </span>
        </div>
        <div>
          <h3 className="text-base font-black leading-tight text-white">
            Transforme seu apoio em compromisso mensal
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            Com o Pix Automático, você ajuda o Instituto com R$ {amount.toFixed(2)} todo mês (débito agendado no dia 5). Sem burocracia e com cancelamento em 1 clique.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => setSubStep('D5_ACTIVATE_PIX')}
            className="flex-1 rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-3 px-4 text-xs transition-all shadow hover:-translate-y-0.5 flex items-center justify-center gap-1.5 uppercase tracking-wide"
          >
            <Repeat className="w-4 h-4 text-[#101625]" />
            <span>Ativar Pix Automático</span>
          </button>
          <button
            onClick={() => setSubStep('ONE_TIME_KEPT')}
            className="px-4 py-3 rounded-[300px] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all text-center"
          >
            Agora não, manter doação única
          </button>
        </div>
      </div>

      <div className="bg-[#EFF3F8] border border-slate-200 rounded-2xl p-3.5 text-left space-y-1">
        <div className="flex items-center gap-2 text-[#101625] text-[11px] font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-[#006400]" />
          <span>Comprovante Enviado</span>
        </div>
        <p className="text-[11px] text-[#2C394C] leading-relaxed">
          Enviamos uma mensagem de agradecimento e o recibo oficial para o seu e-mail cadastrado.
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        <button
          onClick={onReset}
          className="w-full rounded-[300px] bg-slate-100 hover:bg-slate-200 text-[#101625] font-bold py-3 px-4 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Heart className="w-4 h-4 text-[#101625]" />
          <span>Fazer Outra Doação</span>
        </button>
      </div>
    </div>
  );
};

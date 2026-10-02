import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Mail,
  History,
  Repeat,
  LogOut,
  AlertCircle,
  CheckCircle,
  FileText,
  CreditCard,
  QrCode,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';

export const DonorPortalPage: React.FC = () => {
  // Auth state
  const [email, setEmail] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [donorToken, setDonorToken] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Portal data state
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Subscriptions cancel confirmation
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.requestDonorOtp(email);
      setStep('verify');
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao solicitar código de acesso');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.verifyDonorOtp(email, otpCode);
      setDonorToken(res.token);
      loadPortalData(res.token);
    } catch (err: any) {
      setError(err.message || 'Código OTP inválido');
    } finally {
      setLoading(false);
    }
  };

  const loadPortalData = async (token: string) => {
    try {
      setLoading(true);
      const data = await api.getDonorPortal(token);
      setPortalData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do doador');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    if (!donorToken) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.cancelDonorSubscription(donorToken, subId);
      setActionSuccess(res.message);
      setConfirmCancelId(null);
      loadPortalData(donorToken);
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMarketing = async (currentVal: boolean) => {
    if (!donorToken) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.updateDonorMarketingOptIn(donorToken, !currentVal);
      setActionSuccess(res.message);
      loadPortalData(donorToken);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar consentimento');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymize = async () => {
    if (!donorToken) return;
    if (!window.confirm('Tem certeza de que deseja anonimizar permanentemente seus dados em nossa base (LGPD)? Suas assinaturas ativas serão canceladas.')) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.requestDonorAnonymization(donorToken);
      alert(res.message);
      handleLogout();
    } catch (err: any) {
      setError(err.message || 'Erro ao anonimizar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setDonorToken(null);
    setPortalData(null);
    setStep('request');
    setEmail('');
    setOtpCode('');
    setDevOtpHint(null);
  };

  // 1. Tela de Login Sem Senha (OTP de uso único)
  if (!donorToken) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-[28px] shadow-2xl border border-slate-200 p-8">
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center mb-3">
            <img src="/logo.svg" alt="Instituto Social Ebenézer" className="h-10 w-auto" />
          </div>
          <h2 className="text-2xl font-black text-[#101625]">Área do Doador</h2>
          <p className="text-xs text-[#2C394C]">
            Acesso seguro sem senha via código de uso único por e-mail (Magic Code / OTP)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#101625] uppercase tracking-wider mb-2">
                Seu E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#EFF3F8] border border-slate-200 rounded-xl text-xs text-[#2C394C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00FB00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] disabled:opacity-50 text-[#101625] font-black py-4 px-6 shadow-md hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wide"
            >
              {loading ? 'Enviando código...' : 'Receber Código de Acesso'}
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-4">
              Por proteção à sua privacidade (LGPD), não compartilhamos nem confirmamos a existência de cadastros publicamente.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-[#EFF3F8] border border-slate-200 text-[#101625] p-4 rounded-2xl text-xs">
              Código de verificação de uso único enviado para: <br />
              <strong className="font-bold text-[#101625]">{email}</strong> (expira em 15 minutos).
            </div>

            {devOtpHint && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>Código para teste rápido:</span>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtpHint)}
                  className="font-mono font-bold bg-amber-200/80 px-2.5 py-1 rounded text-amber-950 hover:bg-amber-300"
                >
                  {devOtpHint} (Clique p/ preencher)
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#101625] uppercase tracking-wider mb-2">
                Código OTP de 6 Dígitos
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest font-mono text-2xl py-3 bg-[#EFF3F8] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00FB00]"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-1/3 rounded-[300px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 text-xs transition-all"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length < 4}
                className="w-2/3 rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] disabled:opacity-50 text-[#101625] font-black py-3 shadow-md hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wide"
              >
                {loading ? 'Validando...' : 'Acessar Meu Painel'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // 2. Tela Autenticada do Portal do Doador
  const donor = portalData?.donor;
  const donations = portalData?.donations || [];
  const subscriptions = portalData?.subscriptions || [];
  const totalDonated = donations.reduce((sum: number, d: any) => (d.status === 'PAID' ? sum + d.amount : sum), 0);
  const activeSubsCount = subscriptions.filter((s: any) => s.status === 'ACTIVE').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Top Banner de Boas-vindas */}
      <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00FB00] rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-[#006400] uppercase tracking-wider">
              Área Exclusiva do Doador (Sessão Segura)
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#101625]">
            Olá, {donor?.fullName || 'Doador'}!
          </h1>
          <p className="text-xs text-slate-500">
            {donor?.email} {donor?.taxIdCpfMasked && `• CPF: ${donor?.taxIdCpfMasked}`}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-[300px] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* Card de Impacto Acumulado no Instituto Social Ebenézer (D6) */}
      <div className="bg-[#101625] text-white rounded-[28px] p-6 md:p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FB00]/15 text-[#00FB00] text-xs font-bold border border-[#00FB00]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#00FB00]" />
            <span>Impacto Social Acumulado • Tela D6</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Você já doou R$ {totalDonated.toFixed(2)} no total
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Seu apoio financeiro regular financia diretamente as refeições balanceadas, materiais pedagógicos e acolhimento direto a crianças e famílias em vulnerabilidade no Jardim Ângela.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[200px]">
          <span className="text-[11px] text-[#00FB00] block font-bold uppercase tracking-wider">
            Total de Doações
          </span>
          <span className="text-3xl font-black text-white block my-1">
            {donations.filter((d: any) => d.status === 'PAID').length || donations.length}
          </span>
          <span className="text-[11px] text-slate-300 block font-medium">
            {activeSubsCount > 0 ? '🌱 Recorrência Mensal Ativa' : 'Apoiador do Instituto'}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 font-bold ml-4 hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Principal: Assinaturas Recorrentes & Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda: Assinaturas Recorrentes e LGPD */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card de Assinaturas Recorrentes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
              <Repeat className="w-4 h-4 text-emerald-600" />
              <span>Minhas Doações Mensais</span>
            </div>

            {subscriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Você não possui assinaturas recorrentes ativas.
              </p>
            ) : (
              subscriptions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-slate-900 text-base">
                        R$ {sub.amount.toFixed(2)}/mês
                      </span>
                      <p className="text-[11px] text-slate-500">{sub.campaignId}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {sub.status === 'ACTIVE' ? 'Ativa' : sub.status === 'PENDING' ? 'Pendente' : 'Cancelada'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {sub.paymentMethod === 'CREDIT_CARD' ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>Cartão {sub.cardBrand || 'Crédito'} final {sub.cardLast4 || '****'}</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pix Recorrente Mensal</span>
                        </>
                      )}
                    </div>
                    {sub.status === 'ACTIVE' && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Próximo ciclo: {new Date(sub.nextBillingDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {sub.status === 'ACTIVE' && (
                    <div className="pt-2 border-t border-slate-200/60">
                      {confirmCancelId === sub.id ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-rose-700 font-semibold">
                            Deseja realmente cancelar sua contribuição mensal?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancelSubscription(sub.id)}
                              className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded-lg text-xs"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmCancelId(null)}
                              className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1.5 rounded-lg text-xs"
                            >
                              Voltar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(sub.id)}
                          className="w-full text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-1.5 rounded-lg transition-all"
                        >
                          Cancelar Assinatura
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Card de Privacidade & LGPD (Artigo 18) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Privacidade & Direitos LGPD</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="marketingOptIn"
                  checked={donor?.marketingOptIn || false}
                  onChange={() => handleToggleMarketing(donor?.marketingOptIn || false)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="marketingOptIn" className="text-slate-600 leading-snug cursor-pointer">
                  Receber comunicados com novidades e prestação de contas das campanhas por e-mail.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 mb-2">
                  Deseja remover seus dados cadastrais em conformidade com o Art. 18 da LGPD?
                </p>
                <button
                  onClick={handleAnonymize}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium underline"
                >
                  Solicitar Anonimização de Cadastro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Histórico Geral de Doações e Recibos */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Histórico Completo de Contribuições</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {donations.length} registro(s)
              </span>
            </div>

            {donations.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">
                Nenhuma doação registrada para esta conta.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Campanha</th>
                      <th className="py-2.5 px-3">Forma</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Comprovante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.map((d: any) => (
                      <tr key={d.intentId} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 text-slate-500 font-mono">
                          {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {d.campaignId}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                            {d.paymentMethod === 'PIX' ? 'Pix' : 'Cartão'}
                            {d.frequency === 'MONTHLY' && ' (Mensal)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          R$ {d.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              d.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'EXPIRED'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status === 'PAID' ? 'Confirmado' : d.status === 'EXPIRED' ? 'Expirado' : d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {d.receiptNumber ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                              <FileText className="w-3 h-3" />
                              {d.receiptNumber}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

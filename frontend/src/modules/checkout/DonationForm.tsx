import React, { useState, useEffect } from 'react';
import { api, Campaign, CheckoutResponse, PaymentMethod, DonationFrequency } from '../../services/api';
import { ShieldCheck, Info, CreditCard, QrCode, Repeat, Check, UserX } from 'lucide-react';

interface DonationFormProps {
  onSuccess: (data: CheckoutResponse) => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({ onSuccess }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // Modalidade e Meio de Pagamento
  const [frequency, setFrequency] = useState<DonationFrequency>('ONE_TIME');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');

  // Dados do Doador & Modo Anônimo (D2)
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [wantCpfReceipt, setWantCpfReceipt] = useState<boolean>(false);
  const [taxIdCpf, setTaxIdCpf] = useState<string>('');
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);

  // Dados do Cartão de Crédito
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCampaigns()
      .then((data) => {
        setCampaigns(data);
        if (data.length > 0) setSelectedCampaign(data[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < 5) {
      setError('O valor mínimo para doação é R$ 5,00.');
      return;
    }

    if (!isAnonymous && (!fullName.trim() || !email.trim())) {
      setError('Por favor, informe seu nome e e-mail para emissão do comprovante.');
      return;
    }

    if (paymentMethod === 'CREDIT_CARD') {
      if (!cardHolder.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setError('Preencha todos os campos obrigatórios do cartão de crédito.');
        return;
      }
    }

    const finalDonorName = isAnonymous ? 'Doador Anônimo' : fullName.trim();
    const finalDonorEmail = isAnonymous ? (email.trim() || 'anonimo@ebenezer.org.br') : email.trim();

    try {
      setLoading(true);
      const res = await api.createCheckout({
        campaignId: selectedCampaign,
        amount,
        donorName: finalDonorName,
        donorEmail: finalDonorEmail,
        donorPhone: isAnonymous ? undefined : (phone || undefined),
        taxIdCpf: !isAnonymous && wantCpfReceipt && taxIdCpf ? taxIdCpf : undefined,
        marketingOptIn: isAnonymous ? false : marketingOptIn,
        paymentMethod,
        frequency,
        creditCard: paymentMethod === 'CREDIT_CARD' ? {
          holderName: cardHolder,
          number: cardNumber.replace(/\s/g, ''),
          expiry: cardExpiry,
          cvv: cardCvv,
        } : undefined,
      });
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar doação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden max-w-xl mx-auto">
      {/* Official Ebenézer Header */}
      <div className="bg-[#101625] p-7 text-white text-center relative overflow-hidden">
        <div className="flex justify-center mb-3">
          <img src="/logo-white.svg" alt="Instituto Social Ebenézer" className="h-10 w-auto" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Transforme Vidas Conosco</h2>
        <p className="text-slate-300 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
          Sua contribuição apoia alimentação, acolhimento e oficinas socioeducativas no Jardim Ângela
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1. SELETOR DE FREQUÊNCIA: Única vs Mensal (Recorrente) */}
        <div>
          <label className="block text-xs font-bold text-[#101625] uppercase tracking-wider mb-2.5">
            Frequência da Contribuição
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFrequency('ONE_TIME')}
              className={`py-3.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                frequency === 'ONE_TIME'
                  ? 'border-[#00FB00] bg-[#EFF3F8] text-[#101625] ring-2 ring-[#00FB00] shadow-sm'
                  : 'border-slate-200 bg-white text-[#2C394C] hover:bg-[#EFF3F8]'
              }`}
            >
              <span>Doação Única</span>
              {frequency === 'ONE_TIME' && <Check className="w-4 h-4 text-[#101625]" />}
            </button>

            <button
              type="button"
              onClick={() => setFrequency('MONTHLY')}
              className={`py-3.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                frequency === 'MONTHLY'
                  ? 'border-[#00FB00] bg-[#EFF3F8] text-[#101625] ring-2 ring-[#00FB00] shadow-sm'
                  : 'border-slate-200 bg-white text-[#2C394C] hover:bg-[#EFF3F8]'
              }`}
            >
              <Repeat className="w-4 h-4 text-[#101625]" />
              <span>Doação Mensal (Recorrente)</span>
              {frequency === 'MONTHLY' && <Check className="w-4 h-4 text-[#101625]" />}
            </button>
          </div>
          {frequency === 'MONTHLY' && (
            <p className="text-[11px] text-[#101625] bg-[#EFF3F8] p-2.5 rounded-xl border border-slate-200 mt-2 flex items-center gap-1.5 font-medium">
              <span>🌱 <strong>Compromisso mensal:</strong> pode ser pausado ou cancelado a qualquer instante com 1 clique.</span>
            </p>
          )}
        </div>

        {/* 2. SELETOR DE MÉTODO DE PAGAMENTO: Pix vs Cartão */}
        <div>
          <label className="block text-xs font-bold text-[#101625] uppercase tracking-wider mb-2.5">
            Forma de Pagamento
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('PIX')}
              className={`py-3.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                paymentMethod === 'PIX'
                  ? 'border-[#00FB00] bg-[#EFF3F8] text-[#101625] ring-2 ring-[#00FB00] shadow-sm'
                  : 'border-slate-200 bg-white text-[#2C394C] hover:bg-[#EFF3F8]'
              }`}
            >
              <QrCode className="w-4 h-4 text-[#101625]" />
              <span>{frequency === 'MONTHLY' ? 'Pix Recorrente' : 'Pix Instantâneo'}</span>
              {paymentMethod === 'PIX' && <Check className="w-4 h-4 text-[#101625]" />}
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CREDIT_CARD')}
              className={`py-3.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                paymentMethod === 'CREDIT_CARD'
                  ? 'border-[#00FB00] bg-[#EFF3F8] text-[#101625] ring-2 ring-[#00FB00] shadow-sm'
                  : 'border-slate-200 bg-white text-[#2C394C] hover:bg-[#EFF3F8]'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#101625]" />
              <span>Cartão de Crédito</span>
              {paymentMethod === 'CREDIT_CARD' && <Check className="w-4 h-4 text-[#101625]" />}
            </button>
          </div>
        </div>

        {/* Escolha da Campanha */}
        <div>
          <label className="block text-xs font-bold text-[#101625] uppercase tracking-wider mb-1.5">Campanha Beneficiada</label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#2C394C] bg-[#EFF3F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00FB00] font-medium"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seleção de Valores */}
        <div>
          <label className="block text-xs font-bold text-[#101625] uppercase tracking-wider mb-2">
            Valor {frequency === 'MONTHLY' ? 'da Mensalidade' : 'da Doação'}
          </label>
          <div className="grid grid-cols-4 gap-2.5 mb-2.5">
            {[25, 50, 100, 200].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAmountSelect(val)}
                className={`py-3 rounded-xl font-black text-xs transition-all ${
                  amount === val && !customAmount
                    ? 'bg-[#00FB00] text-[#101625] shadow-md ring-2 ring-[#00FB00]'
                    : 'bg-[#EFF3F8] text-[#2C394C] hover:bg-slate-200'
                }`}
              >
                R$ {val}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">R$</span>
            <input
              type="text"
              placeholder="Outro valor (mínimo R$ 5,00)"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="w-full border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2C394C] bg-white focus:outline-none focus:ring-2 focus:ring-[#00FB00]"
            />
          </div>
        </div>

        {/* FORMULÁRIO DO CARTÃO DE CRÉDITO (se selecionado) */}
        {paymentMethod === 'CREDIT_CARD' && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Dados do Cartão de Crédito</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome Impresso no Cartão *</label>
              <input
                type="text"
                required
                placeholder="Ex: MARIA S LIMA"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número do Cartão *</label>
              <input
                type="text"
                required
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                  setCardNumber(v);
                }}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Validade (MM/AA) *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="12/28"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV (Código de Segurança) *</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Criptografia PCI-DSS de 256 bits. O número completo do seu cartão nunca é gravado.</span>
            </div>
          </div>
        )}

        {/* Dados de Contato do Doador (D2: com opção "Doar sem se identificar") */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identificação do Doador (D2)</h3>
            <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) {
                    setWantCpfReceipt(false);
                    setTaxIdCpf('');
                  }
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <UserX className="w-3.5 h-3.5 text-emerald-700" />
              <span>Doar sem se identificar (Anônimo)</span>
            </label>
          </div>

          {isAnonymous ? (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-2 animate-fade-in">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Modo de Doação Anônima Ativado</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Nenhum dado pessoal (nome ou CPF) será solicitado ou armazenado em nossos servidores. Caso queira receber o recibo da doação por e-mail, informe-o opcionalmente abaixo:
              </p>
              <div>
                <input
                  type="email"
                  placeholder="Seu e-mail (opcional, apenas para envio do recibo)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria da Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Telefone (Opcional)</label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Minimização LGPD - CPF Opcional */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="flex items-center text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantCpfReceipt}
                    onChange={(e) => setWantCpfReceipt(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-2"
                  />
                  Desejo informar meu CPF para recibo nominal identificado
                </label>
                {wantCpfReceipt && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={taxIdCpf}
                      onChange={(e) => setTaxIdCpf(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Consentimento de Marketing */}
              <div>
                <label className="flex items-start text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-2"
                  />
                  <span>Desejo receber notícias e relatórios periódicos de impacto do Instituto Ebenézer por e-mail (opcional).</span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Botão de Envio Estilo Pill Oficial Ebenézer */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[300px] bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] font-black py-4 px-6 shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 text-sm tracking-wide"
        >
          {loading ? (
            <span>Processando doação...</span>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 text-[#101625]" />
              <span>
                {paymentMethod === 'CREDIT_CARD'
                  ? `Pagar com Cartão — R$ ${amount.toFixed(2)}${frequency === 'MONTHLY' ? '/mês' : ''}`
                  : `Gerar Pix ${frequency === 'MONTHLY' ? 'Recorrente' : 'Instantâneo'} — R$ ${amount.toFixed(2)}`}
              </span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-[#2C394C] text-center font-medium">
          <Info className="w-4 h-4 text-[#006400] shrink-0" />
          <span>Cobrança emitida para <strong>Instituto de Cultura e Lazer Ebenézer (CNPJ 30.434.044/0001-90)</strong>. Ambiente 100% auditado.</span>
        </div>
      </form>
    </div>
  );
};

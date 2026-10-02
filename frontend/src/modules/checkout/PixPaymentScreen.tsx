import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckoutResponse, api } from '../../services/api';
import { Copy, Check, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface PixPaymentScreenProps {
  checkoutData: CheckoutResponse;
  onPaymentConfirmed: (paidAt?: string | null) => void;
  onCancel: () => void;
}

export const PixPaymentScreen: React.FC<PixPaymentScreenProps> = ({
  checkoutData,
  onPaymentConfirmed,
  onCancel,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutos em segundos
  const [status, setStatus] = useState<string>(checkoutData.status);
  const [checking, setChecking] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // 1. Contador regressivo de expiração
  useEffect(() => {
    const expireTime = new Date(checkoutData.expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((expireTime - now) / 1000));
      setTimeLeft(diffSeconds);

      if (diffSeconds <= 0) {
        setIsExpired(true);
        setStatus('EXPIRED');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkoutData.expiresAt]);

  // 2. Polling periódico de verificação com backoff controlado (RF-004 e RF-006)
  useEffect(() => {
    if (isExpired || status === 'PAID') return;

    let timer: NodeJS.Timeout;
    let delay = 2500; // Começa em 2.5 segundos

    const checkStatus = async () => {
      try {
        const res = await api.getDonationStatus(checkoutData.intentId);
        setStatus(res.status);

        if (res.status === 'PAID') {
          onPaymentConfirmed(res.paidAt);
          return;
        }

        if (res.status === 'EXPIRED') {
          setIsExpired(true);
          return;
        }

        // Aumenta ligeiramente o intervalo até o teto de 6s (backoff suave)
        delay = Math.min(delay * 1.1, 6000);
        timer = setTimeout(checkStatus, delay);
      } catch (err) {
        console.error('Erro no polling:', err);
        timer = setTimeout(checkStatus, 5000);
      }
    };

    timer = setTimeout(checkStatus, delay);

    return () => clearTimeout(timer);
  }, [checkoutData.intentId, isExpired, status, onPaymentConfirmed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(checkoutData.copyPasteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await api.getDonationStatus(checkoutData.intentId);
      setStatus(res.status);
      if (res.status === 'PAID') {
        onPaymentConfirmed(res.paidAt);
      }
    } finally {
      setTimeout(() => setChecking(false), 800);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 max-w-lg mx-auto p-6 md:p-8 text-center space-y-6">
      <div className="space-y-2">
        <div className="flex justify-center mb-1">
          <img src="/logo.svg" alt="Instituto Social Ebenézer" className="h-9 w-auto" />
        </div>
        <h2 className="text-2xl font-black text-[#101625]">Pague com Pix Instantâneo</h2>
        <p className="text-xs text-[#2C394C]">
          Abra o app do seu banco, escolha Pix e escaneie o QR Code ou use o Copia e Cola
        </p>
      </div>

      {/* Valor e Beneficiário Oficial */}
      <div className="bg-[#EFF3F8] rounded-2xl p-4 border border-slate-200 flex justify-between items-center text-left">
        <div>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">Valor da Doação</span>
          <span className="text-2xl font-black text-[#101625]">R$ {checkoutData.amount.toFixed(2)}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">Beneficiário Oficial</span>
          <span className="text-xs font-bold text-[#101625] block">Instituto Ebenézer</span>
          <span className="text-[10px] text-slate-500 font-mono block">CNPJ 30.434.044/0001-90</span>
        </div>
      </div>

      {isExpired ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-2xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-base">Este QR Code Pix Expirou</h3>
          <p className="text-xs text-amber-800">
            O tempo limite para pagamento deste código foi atingido. Por segurança, gere uma nova contribuição.
          </p>
          <button
            onClick={onCancel}
            className="w-full rounded-[300px] bg-[#101625] hover:bg-[#1E2538] text-white font-bold py-3 px-4 text-xs transition-all"
          >
            Gerar Nova Doação
          </button>
        </div>
      ) : (
        <>
          {/* QR Code Container */}
          <div className="flex justify-center p-5 bg-[#EFF3F8] border border-slate-200 rounded-3xl shadow-inner inline-block mx-auto">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <QRCodeSVG value={checkoutData.copyPasteCode || ''} size={210} level="M" />
            </div>
          </div>

          {/* Contador de Tempo */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#2C394C]">
            <Clock className="w-4 h-4 text-[#006400]" />
            <span>Código válido por: <strong className="text-[#101625] font-mono text-sm">{formatTimer(timeLeft)}</strong></span>
          </div>

          {/* Campo Copia e Cola */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-[#101625] uppercase tracking-wider block">Código Pix Copia e Cola:</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={checkoutData.copyPasteCode || ''}
                className="w-full bg-[#EFF3F8] border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-[#2C394C] font-mono pr-28 truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`absolute right-1.5 top-1.5 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  copied
                    ? 'bg-[#101625] text-[#00FB00]'
                    : 'bg-[#00FB00] hover:bg-[#00DB00] text-[#101625]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Status e Ações */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className="w-full py-3.5 px-4 rounded-[300px] bg-[#101625] hover:bg-[#1E2538] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow"
            >
              <RefreshCw className={`w-4 h-4 text-[#00FB00] ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Verificando confirmação...' : 'Já fiz o Pix no meu banco (Verificar)'}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 py-1 font-medium transition-colors"
            >
              Cancelar e voltar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

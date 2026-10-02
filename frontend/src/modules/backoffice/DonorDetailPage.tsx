import React, { useState, useEffect } from 'react';
import { api, DonorDetailResponse } from '../../services/api';
import { ArrowLeft, Send, Trash2, ShieldAlert, CheckCircle2, Clock, Mail, RefreshCw, Eye, X } from 'lucide-react';

interface DonorDetailPageProps {
  token: string;
  donorId: string;
  onBack: () => void;
}

export const DonorDetailPage: React.FC<DonorDetailPageProps> = ({ token, donorId, onBack }) => {
  const [data, setData] = useState<DonorDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; html: string; text: string } | null>(null);
  const [loadingEmailPreview, setLoadingEmailPreview] = useState(false);

  useEffect(() => {
    loadDonor();
  }, [donorId, token]);

  const loadDonor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDonorDetail(token, donorId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do doador');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewEmail = async () => {
    setLoadingEmailPreview(true);
    try {
      const res = await api.getInviteEmailPreview(token, donorId);
      setEmailPreview(res);
      setShowEmailModal(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar preview do e-mail');
    } finally {
      setLoadingEmailPreview(false);
    }
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      const res = await api.inviteDonorRecurring(token, donorId);
      setInviteSuccessMsg(res.message);
      if (res.previewHtml && res.subject) {
        setEmailPreview({
          subject: res.subject,
          html: res.previewHtml,
          text: '',
        });
      }
      // Recarrega para refletir novo evento na linha do tempo
      await loadDonor();
      setTimeout(() => setInviteSuccessMsg(null), 8000);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar convite');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      await api.deleteDonorData(token, donorId);
      alert('Dados do titular eliminados com sucesso (Art. 18 LGPD). Registros fiscais foram anonimizados.');
      setShowDeleteModal(false);
      onBack();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir dados do doador');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0b5344] mb-3" />
        <p className="text-sm font-medium">Carregando perfil do doador...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
        <p className="font-bold">Erro ao carregar doador</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const { donor, timeline, legalBasis } = data;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para doadores</span>
        </button>
      </div>

      {inviteSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{inviteSuccessMsg}</span>
          </div>
          {emailPreview && (
            <button
              onClick={() => setShowEmailModal(true)}
              className="text-xs font-bold text-[#0b5344] bg-white px-3 py-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-50 shadow-sm flex items-center gap-1.5 w-fit"
            >
              <Eye className="w-3.5 h-3.5 text-[#0b5344]" />
              <span>Ver E-mail Despachado</span>
            </button>
          )}
        </div>
      )}

      {/* Header do Doador com Nome, Badges e Botões de Convite & Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0b5344]/10 text-[#0b5344] font-black text-lg flex items-center justify-center border border-[#0b5344]/20">
            {donor.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {donor.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  donor.status === 'Recorrente'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-[#e2f0ec] text-[#0b5344] border border-[#c4e2d8]'
                }`}
              >
                {donor.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {donor.originChannel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">ID do Doador: {donor.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePreviewEmail}
            disabled={loadingEmailPreview}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#0b5344]" />
            <span>{loadingEmailPreview ? 'Carregando...' : 'Visualizar E-mail da Régua'}</span>
          </button>

          <button
            onClick={handleInvite}
            disabled={inviting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0b5344] hover:bg-[#07392f] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0b5344]/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{inviting ? 'Enviando...' : 'Convidar para doação mensal'}</span>
          </button>
        </div>
      </div>

      {/* Grid de 3 Colunas (Exata réplica do PDF 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Coluna 1: Dados de contato */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-4 h-4 text-[#0b5344]" />
            <h2 className="text-sm font-bold text-slate-900">Dados de contato</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                E-MAIL
              </span>
              <span className="font-semibold text-slate-800 break-all">{donor.email}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                WHATSAPP
              </span>
              <span className="font-semibold text-slate-800">{donor.phone}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                CANAL DE ORIGEM
              </span>
              <span className="font-semibold text-slate-800">{donor.originChannel}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                PRIMEIRO CONTATO
              </span>
              <span className="font-semibold text-slate-800">{donor.firstContactDate}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                PREFERÊNCIA DE CONTATO
              </span>
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 font-bold text-slate-700">
                {donor.contactPreference}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Linha do tempo */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-[#0b5344]" />
            <h2 className="text-sm font-bold text-slate-900">Linha do tempo</h2>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((event) => {
              const isDonation = event.type === 'DONATION';
              const isComm = event.type === 'COMMUNICATION';

              return (
                <div key={event.id} className="relative group">
                  {/* Dot */}
                  <span
                    className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      isDonation ? 'bg-[#0b5344]' : isComm ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  />
                  <div className="text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 block">{event.date}</span>
                    <span className="font-medium text-slate-800 block mt-0.5">{event.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 3: Base legal dos dados (Mapeamento LGPD) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#0b5344]" />
              <h2 className="text-sm font-bold text-slate-900">Base legal dos dados</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Mapeamento LGPD para este titular</p>
          </div>

          {/* Lista de Bases Legais por Campo */}
          <div className="space-y-3.5 text-xs">
            {legalBasis.map((lb) => (
              <div key={lb.field} className="pb-2.5 border-b border-slate-50 last:border-b-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {lb.field}
                </span>
                <div className="font-semibold text-slate-800">
                  {lb.ground} <span className="text-slate-400 font-normal">({lb.controller})</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Retenção: {lb.retention}
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Exclusão LGPD (Art. 18) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Apagar dados deste doador</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Direito de eliminação — Art. 18, VI da LGPD. Dados fiscais serão anonimizados, não excluídos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão LGPD */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Confirmar eliminação de dados (LGPD)
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Você está prestes a exercer o direito de eliminação do titular <strong>{donor.name}</strong>. Os
              dados pessoais identificáveis serão apagados imediatamente. Dados financeiros continuarão
              preservados de forma <strong>estritamente anonimizada</strong> para cumprimento de obrigação legal
              fiscal (5 anos).
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteData}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                {deleting ? 'Apagando...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização do E-mail (Design System Oficial) */}
      {showEmailModal && emailPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Header do Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Modelo de E-mail: Régua de Relacionamento
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Template transacional renderizado no <strong>Design System Oficial Ebenézer</strong>
                </p>
              </div>

              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cabeçalho de Metadados do E-mail */}
            <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-bold text-slate-700">De:</span> Instituto Ebenézer &lt;comunicacao@ebenezer.org.br&gt;
              </div>
              <div>
                <span className="font-bold text-slate-700">Para:</span> {donor.name} &lt;{donor.email}&gt;
              </div>
              <div>
                <span className="font-bold text-slate-700">Assunto:</span> <span className="font-semibold text-emerald-900">{emailPreview.subject}</span>
              </div>
            </div>

            {/* Preview do HTML do E-mail */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <iframe
                  title="Preview E-mail Convite Recorrente"
                  srcDoc={emailPreview.html}
                  className="w-full h-[450px] border-0"
                />
              </div>
            </div>

            {/* Rodapé com Ações */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                🌱 Design System: Pine Green (#082f25), Fontes do Sistema & LGPD Nativa
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    handleInvite();
                  }}
                  disabled={inviting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b5344] hover:bg-[#07392f] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{inviting ? 'Enviando...' : 'Confirmar Envio'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

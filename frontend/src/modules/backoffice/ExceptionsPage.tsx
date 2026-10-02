import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ArrowLeft, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';

interface ExceptionsPageProps {
  token: string;
  onBack: () => void;
}

export const ExceptionsPage: React.FC<ExceptionsPageProps> = ({ token, onBack }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [justification, setJustification] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<string>('SETTLED');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadExceptions = async () => {
    try {
      setLoading(true);
      const res = await api.getExceptions(token);
      setItems(res);
    } catch (err: any) {
      setFeedback(`Erro ao carregar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExceptions();
  }, [token]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (justification.trim().length < 10) {
      alert('A justificativa é obrigatória com no mínimo 10 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      await api.resolveException(token, selectedItem.id, targetStatus, justification);
      setSelectedItem(null);
      setJustification('');
      setFeedback('Item conciliado com sucesso e ação registrada na trilha de auditoria.');
      loadExceptions();
    } catch (err: any) {
      alert(err.message || 'Falha ao conciliar item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </button>

        <button
          onClick={loadExceptions}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-800">Caixa de Exceções Financeiras</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Triagem assistida e conciliação manual de pagamentos tardios, valores divergentes e Pix sem intenção
        </p>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-950 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Tabela de Itens */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Referência Externa</th>
                <th className="py-3 px-4 font-semibold">Valor Esperado</th>
                <th className="py-3 px-4 font-semibold">Valor Recebido</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Motivo da Exceção</th>
                <th className="py-3 px-4 font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                    {item.externalReference}
                  </td>
                  <td className="py-3 px-4 font-medium">R$ {item.expectedAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">R$ {item.actualAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'SETTLED'
                          ? 'bg-teal-100 text-teal-800'
                          : item.status === 'DIVERGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs">{item.discrepancyReason || '—'}</td>
                  <td className="py-3 px-4">
                    {item.status !== 'SETTLED' ? (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-lg text-xs"
                      >
                        Conciliar
                      </button>
                    ) : (
                      <span className="text-teal-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Liquidado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Nenhuma divergência ou exceção pendente. A conciliação está em dia!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Resolução Justificada */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Conciliação Assistida
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <div>
                <span className="text-slate-500">Referência: </span>
                <span className="font-mono text-slate-700">{selectedItem.externalReference}</span>
              </div>
              <div>
                <span className="text-slate-500">Valor Efetivo: </span>
                <strong className="text-slate-800">R$ {selectedItem.actualAmount.toFixed(2)}</strong>
              </div>
              <p className="text-amber-800 text-[11px] pt-1">{selectedItem.discrepancyReason}</p>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Destino</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="targetStatus"
                      value="SETTLED"
                      checked={targetStatus === 'SETTLED'}
                      onChange={() => setTargetStatus('SETTLED')}
                      className="mr-1.5 text-emerald-600"
                    />
                    SETTLED (Aprovado / Liquidado)
                  </label>
                  <label className="flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="targetStatus"
                      value="UNDER_REVIEW"
                      checked={targetStatus === 'UNDER_REVIEW'}
                      onChange={() => setTargetStatus('UNDER_REVIEW')}
                      className="mr-1.5 text-amber-600"
                    />
                    UNDER_REVIEW (Manter em análise)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justificativa Operacional (Obrigatória para Auditoria) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a razão da aprovação, confirmação bancária ou contato com o doador..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Gravando auditoria...' : 'Confirmar Conciliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

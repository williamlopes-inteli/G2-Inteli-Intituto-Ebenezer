import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface IndicatorsVaultPageProps {
  token: string;
  onBack: () => void;
}

export const IndicatorsVaultPage: React.FC<IndicatorsVaultPageProps> = ({ token, onBack }) => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form novo indicador
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Educação & Cidadania');
  const [newValue, setNewValue] = useState<number>(100);
  const [newUnit, setNewUnit] = useState<string>('crianças');
  const [newPeriod, setNewPeriod] = useState<string>('4º Trimestre 2026');
  const [newSource, setNewSource] = useState<string>('');
  const [newEvidence, setNewEvidence] = useState<string>('');

  // Rejeição modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminIndicators(token);
      setIndicators(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar indicadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.createIndicator(token, {
        code: newCode,
        name: newName,
        category: newCategory,
        metricValue: Number(newValue),
        metricUnit: newUnit,
        period: newPeriod,
        sourceDescription: newSource,
        privateEvidenceNotes: newEvidence,
      });
      setSuccess('Indicador elaborado com sucesso e enviado para aprovação Maker-Checker!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.approveIndicator(token, id);
      setSuccess('Indicador homologado e publicado no portal de transparência pública!');
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    try {
      setLoading(true);
      setError(null);
      await api.rejectIndicator(token, rejectingId, rejectReason);
      setSuccess('Indicador rejeitado com justificativa.');
      setRejectingId(null);
      setRejectReason('');
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewCode('');
    setNewName('');
    setNewCategory('Educação & Cidadania');
    setNewValue(100);
    setNewUnit('crianças');
    setNewPeriod('4º Trimestre 2026');
    setNewSource('');
    setNewEvidence('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-600" />
            <span>Cofre de Números & Governança Maker-Checker</span>
          </h1>
          <p className="text-xs text-slate-500">
            Fase 3 (RF-010 / DECISÃO-07): Elaboração, revisão com evidências privadas e trava estrita que impede o elaborador de aprovar a si mesmo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Elaborar Novo Indicador</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="font-bold text-emerald-700">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold text-rose-700">✕</button>
        </div>
      )}

      {/* Tabela de Indicadores do Cofre */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Código / Nome</th>
                <th className="py-3 px-4">Categoria / Período</th>
                <th className="py-3 px-4">Métrica Homologada</th>
                <th className="py-3 px-4">Status & Governança</th>
                <th className="py-3 px-4">Elaborador / Aprovador</th>
                <th className="py-3 px-4 text-right">Ações Maker-Checker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indicators.map((ind) => (
                <tr key={ind.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 block w-max mb-1">
                      {ind.code}
                    </span>
                    <strong className="font-bold text-slate-800 text-sm block">{ind.name}</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">{ind.sourceDescription}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 block">{ind.category}</span>
                    <span className="text-[11px] text-slate-400">{ind.period}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {ind.metricValue.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-1">{ind.metricUnit}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ind.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ind.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800'
                          : ind.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ind.status === 'PUBLISHED'
                        ? 'Publicado'
                        : ind.status === 'PENDING_APPROVAL'
                        ? 'Aguardando Aprovação'
                        : ind.status === 'REJECTED'
                        ? 'Rejeitado'
                        : ind.status}
                    </span>
                    {ind.rejectionReason && (
                      <p className="text-[10px] text-rose-600 mt-1 max-w-xs">{ind.rejectionReason}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] space-y-0.5">
                    <div className="text-slate-600">
                      <strong>Maker:</strong> {ind.creatorEmail}
                    </div>
                    {ind.approverEmail && (
                      <div className="text-emerald-700 font-semibold">
                        <strong>Checker:</strong> {ind.approverEmail}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {ind.status === 'PENDING_APPROVAL' ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(ind.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                          title="Aprovar e Publicar (Trava de segurança: quem criou não pode aprovar)"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(ind.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejeitar</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Homologado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Elaborar Novo Indicador (Maker) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Elaborar Indicador para o Cofre</h3>
            <p className="text-xs text-slate-500">
              O indicador entrará em fila com status <strong>PENDING_APPROVAL</strong> e precisará ser validado por outro usuário (Maker-Checker).
            </p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código Único (ex: IND-REF-2026)</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome do Indicador</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor da Métrica</label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unidade (ex: refeições, crianças)</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Período</label>
                  <input
                    type="text"
                    required
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fonte dos Dados (Pública)</label>
                <textarea
                  required
                  rows={2}
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Ex: Livro de chamadas das oficinas e notas fiscais de alimentos."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notas de Evidências Privadas (Confidencial / Não exposto publicamente)
                </label>
                <textarea
                  rows={2}
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="Ex: Pasta digitalizada /fiscal/2026/setembro/nf-alimentos.pdf contendo termos assinados."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg text-white"
                >
                  Submeter ao Cofre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rejeição com Justificativa */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Rejeitar Indicador</h3>
            <p className="text-xs text-slate-500">
              Forneça a justificativa técnica ou documental para a rejeição da versão do indicador.
            </p>

            <form onSubmit={handleReject} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Divergência encontrada entre a nota fiscal apresentada e o número total lançado."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason('');
                  }}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || rejectReason.length < 5}
                  className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 font-bold rounded-lg text-white"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

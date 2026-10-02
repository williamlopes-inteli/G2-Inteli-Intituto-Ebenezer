import React, { useState, useEffect } from 'react';
import { api, CrmDonor } from '../../services/api';
import { Search, Download, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface DonorsListPageProps {
  token: string;
  initialFilter?: string;
  onSelectDonor: (donorId: string) => void;
}

export const DonorsListPage: React.FC<DonorsListPageProps> = ({ token, initialFilter, onSelectDonor }) => {
  const [donors, setDonors] = useState<CrmDonor[]>([]);
  const [totalCount, setTotalCount] = useState(87);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'recorrentes' | 'pontuais' | 'prontos'>(
    initialFilter === 'ready' ? 'prontos' : 'todos'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    loadDonors();
  }, [token]);

  useEffect(() => {
    if (initialFilter === 'ready') {
      setActiveFilter('prontos');
    }
  }, [initialFilter]);

  const loadDonors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCrmDonors(token);
      setDonors(res.donors);
      setTotalCount(res.total || 87);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar doadores');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.MouseEvent, donorId: string, donorName: string) => {
    e.stopPropagation();
    setInvitingId(donorId);
    try {
      const res = await api.inviteDonorRecurring(token, donorId);
      setInviteSuccessMsg(res.message || `Convite mensal enviado para ${donorName} com sucesso!`);
      setTimeout(() => setInviteSuccessMsg(null), 4000);
      loadDonors();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar convite');
    } finally {
      setInvitingId(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      await api.downloadFinancialReportCsv(token);
    } catch (err: any) {
      alert('Erro ao exportar CSV: ' + err.message);
    }
  };

  // Filter logic
  const filteredDonors = donors.filter((d) => {
    // Search
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.originChannel.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'recorrentes') return d.status === 'Recorrente';
    if (activeFilter === 'pontuais') return d.status === 'Pontual';
    if (activeFilter === 'prontos') return d.recommendedAction === 'Convidar para mensal';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Doadores</h1>
          <p className="text-xs text-slate-500 mt-0.5">{totalCount} doadores identificados</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {inviteSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{inviteSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b5344] focus:border-transparent shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'todos'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({totalCount})
          </button>

          <button
            onClick={() => setActiveFilter('recorrentes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'recorrentes'
                ? 'bg-[#0b5344] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Recorrentes (27)
          </button>

          <button
            onClick={() => setActiveFilter('pontuais')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'pontuais'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pontuais (48)
          </button>

          {/* Destaque Prontos para Convite em Ouro/Amarelo como no PDF */}
          <button
            onClick={() => setActiveFilter('prontos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'prontos'
                ? 'bg-[#facc15] text-[#422006] shadow-sm ring-2 ring-[#eab308]'
                : 'bg-[#fef9c3] text-[#713f12] border border-[#fde047] hover:bg-[#fef08a]'
            }`}
          >
            Prontos para convite (12)
          </button>
        </div>
      </div>

      {/* Tabela de Doadores (Exata réplica de colunas e estilo do PDF 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0b5344]" />
            <span className="text-xs">Carregando lista de doadores...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 text-xs font-semibold">{error}</div>
        ) : filteredDonors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum doador encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Doador</th>
                  <th className="py-3.5 px-4 font-bold">Canal de origem</th>
                  <th className="py-3.5 px-4 font-bold">Última doação</th>
                  <th className="py-3.5 px-4 font-bold">Total doado</th>
                  <th className="py-3.5 px-4 font-bold text-center">Nº de doações</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Ação recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDonors.map((donor) => {
                  const initial = donor.name.charAt(0);
                  const isReady = donor.recommendedAction === 'Convidar para mensal';

                  return (
                    <tr
                      key={donor.id}
                      onClick={() => onSelectDonor(donor.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Doador (Avatar + Nome + Email) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-[#0b5344] transition-colors">
                              {donor.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">{donor.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Canal de Origem */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {donor.originChannel}
                        </span>
                      </td>

                      {/* Última doação */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {donor.lastDonationDate}
                      </td>

                      {/* Total doado */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        R$ {donor.totalDonated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Nº de doações */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                        {donor.donationsCount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            donor.status === 'Recorrente'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : donor.status === 'Pontual'
                              ? 'bg-[#e2f0ec] text-[#0b5344] border border-[#c4e2d8]'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {donor.status}
                        </span>
                      </td>

                      {/* Ação recomendada */}
                      <td className="py-3.5 px-4">
                        {isReady ? (
                          <button
                            onClick={(e) => handleInvite(e, donor.id, donor.name)}
                            disabled={invitingId === donor.id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b5344] hover:text-[#063229] hover:underline"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{invitingId === donor.id ? 'Enviando...' : 'Convidar para mensal'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

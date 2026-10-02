import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DollarSign, CheckCircle, Clock, AlertOctagon, RefreshCw, Repeat, CreditCard, QrCode } from 'lucide-react';

interface DashboardPageProps {
  token: string;
  role?: string;
  onNavigateExceptions: () => void;
  onNavigateVault: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ token, role, onNavigateExceptions, onNavigateVault }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary(token);
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await api.downloadFinancialReportCsv(token);
    } catch (err: any) {
      alert(err.message || 'Falha ao exportar relatório');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando métricas financeiras segregadas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm max-w-xl mx-auto">
        {error}
      </div>
    );
  }

  const roleLabel =
    role === 'COMMUNICATION'
      ? '📣 Comunicação (Maker)'
      : role === 'APPROVER'
      ? '🛡️ Aprovador (Checker)'
      : role === 'FINANCE'
      ? '💼 Financeiro'
      : role === 'AUDITOR_READONLY'
      ? '🔍 Auditor Read-Only'
      : '⚙️ Administrador';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Painel Financeiro & Conciliação</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão consolidada: Pontuais, Recorrência Mensal e segregação estrita de estados contábeis
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateVault}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Cofre de Indicadores (Maker-Checker)</span>
          </button>
          {role !== 'COMMUNICATION' && (
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Exportação protegida com registro imutável em audit_events (RF-005)"
            >
              <span>{exporting ? 'Exportando...' : 'Exportar Relatório CSV'}</span>
            </button>
          )}
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* 5 Cards de Métricas Segregadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Intenções de Doação */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Intenções</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-800">R$ {data?.totalIntentsAmount?.toFixed(2) || '0.00'}</div>
          <div className="text-[11px] text-slate-400">{data?.totalIntentsCount || 0} abertas</div>
        </div>

        {/* Card 2: Confirmadas no Mês */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Confirmadas</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600">R$ {data?.totalPaidAmount?.toFixed(2) || '0.00'}</div>
          <div className="text-[11px] text-emerald-700 font-medium">{data?.totalPaidCount || 0} doações pagas</div>
        </div>

        {/* Card 3: Recorrência Mensal Ativa (Fase 2) */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recorrência Ativa</span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800">R$ {data?.monthlyRecurringVolume?.toFixed(2) || '0.00'}/mês</div>
          <div className="text-[11px] text-emerald-700 font-semibold">{data?.activeSubscriptionsCount || 0} assinaturas ativas</div>
        </div>

        {/* Card 4: Liquidadas em Conta */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Liquidadas</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-700">R$ {data?.totalSettledAmount?.toFixed(2) || '0.00'}</div>
          <div className="text-[11px] text-slate-400">Conciliadas no extrato</div>
        </div>

        {/* Card 5: Caixa de Exceções */}
        <div
          onClick={() => {
            if (role === 'COMMUNICATION') {
              alert('Acesso restrito: A Caixa de Exceções financeiras é exclusiva para os perfis Financeiro e Administração (RBAC).');
              return;
            }
            onNavigateExceptions();
          }}
          className={`p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-1 transition-all ${
            role === 'COMMUNICATION'
              ? 'bg-slate-50 opacity-60 cursor-not-allowed'
              : 'bg-amber-50/70 cursor-pointer hover:bg-amber-100/70'
          }`}
        >
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Caixa Exceções</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-800">{data?.totalPendingExceptionsCount || 0}</div>
          <div className="text-[11px] text-amber-700 font-semibold">
            {role === 'COMMUNICATION' ? 'Acesso restrito (Fin/Admin)' : 'Triagem pendente →'}
          </div>
        </div>
      </div>

      {/* Divisão por Métodos de Pagamento (Pix vs Cartão) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Volume por Método de Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Pix (Pontual & Recorrente)</div>
              <div className="text-base font-bold text-slate-800">
                R$ {data?.methodsBreakdown?.pixAmount?.toFixed(2) || '0.00'}
                <span className="text-xs font-normal text-slate-500 ml-2">({data?.methodsBreakdown?.pixCount || 0} doações)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Cartão de Crédito</div>
              <div className="text-base font-bold text-slate-800">
                R$ {data?.methodsBreakdown?.cardAmount?.toFixed(2) || '0.00'}
                <span className="text-xs font-normal text-slate-500 ml-2">({data?.methodsBreakdown?.cardCount || 0} doações)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Doações Recentes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">Doações Recentes</h2>
          <span className="text-xs text-slate-400">Exibindo últimos registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Doador</th>
                <th className="py-3 px-4 font-semibold">Campanha</th>
                <th className="py-3 px-4 font-semibold">Método</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Valor</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.recentDonations?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{item.donorName}</td>
                  <td className="py-3 px-4 text-slate-500">{item.campaignId}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      {item.paymentMethod === 'CREDIT_CARD' ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Cartão</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pix</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-500">
                      {item.frequency === 'MONTHLY' ? '🌱 Mensal' : 'Única'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">R$ {item.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'LATE_PAYMENT_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'EXPIRED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(item.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {(!data?.recentDonations || data.recentDonations.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhuma doação registrada até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

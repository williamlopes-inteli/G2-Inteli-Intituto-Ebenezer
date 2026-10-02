import React, { useState, useEffect } from 'react';
import { api, CrmDashboardResponse } from '../../services/api';
import { TrendingUp, Users, RefreshCw, AlertTriangle, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';

interface DashboardV2PageProps {
  token: string;
  onNavigateTab: (tab: 'painel' | 'doadores' | 'regua' | 'cofre' | 'prestacao', filter?: string) => void;
}

export const DashboardV2Page: React.FC<DashboardV2PageProps> = ({ token, onNavigateTab }) => {
  const [data, setData] = useState<CrmDashboardResponse | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('Setembro de 2026');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCrmDashboard(token);
      setData(res);
      setSelectedMonth(res.month);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-medium">Carregando painel Ebenézer Recorrente...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
        <p className="font-bold">Erro ao carregar painel</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Max value for bar chart scale
  const maxBarTotal = Math.max(...data.chartData.map((d) => d.total), 5000);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Painel</h1>
          <p className="text-xs text-slate-500 mt-0.5">Visão consolidada da captação recorrente e doadores</p>
        </div>

        {/* Month Selector */}
        <div className="relative inline-block">
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 cursor-pointer hover:border-slate-300">
            <span>{selectedMonth}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas (Exata réplica do PDF 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Receita do Mês */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              RECEITA DO MÊS
            </span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              R$ {data.metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Meta: R$ {data.metrics.targetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0b5344] h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(data.metrics.progressPercent, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-slate-400 font-semibold mt-1">
              {data.metrics.progressPercent}% atingido
            </div>
          </div>
        </div>

        {/* Card 2: % Recorrente */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              % RECORRENTE
            </span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {data.metrics.recurringPercentage}%
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{data.metrics.recurringGrowthPercent}% vs mês anterior</span>
          </div>
        </div>

        {/* Card 3: Doadores Identificados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              DOADORES IDENTIFICADOS
            </span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {data.metrics.identifiedDonorsCount}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>total cadastrado</span>
          </div>
        </div>

        {/* Card 4: Retenção Mensal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              RETENÇÃO MENSAL
            </span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {data.metrics.retentionRatePercent}%
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>recorrentes ativos</span>
          </div>
        </div>
      </div>

      {/* Main Section: Gráfico de Barras Empilhadas + Precisa da sua atenção */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gráfico Recorrente x Pontual (7 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recorrente x pontual</h2>
              <p className="text-xs text-slate-400">Evolução do volume financeiro mensal</p>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#0b5344] inline-block" />
                <span>Recorrente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#b4d4cb] inline-block" />
                <span>Pontual</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras Empilhadas */}
          <div className="pt-8 pb-4">
            <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {data.chartData.map((item) => {
                const totalHeight = (item.total / maxBarTotal) * 100;
                const recShare = (item.recorrente / item.total) * 100;
                const pontShare = (item.pontual / item.total) * 100;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-lg whitespace-nowrap z-20">
                      <p className="font-bold">{item.month}: R$ {item.total.toLocaleString('pt-BR')}</p>
                      <p className="text-emerald-300">Recorrente: R$ {item.recorrente.toLocaleString('pt-BR')}</p>
                      <p className="text-slate-300">Pontual: R$ {item.pontual.toLocaleString('pt-BR')}</p>
                    </div>

                    {/* Stacked Bar Container */}
                    <div
                      className="w-full max-w-[48px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 hover:brightness-105 shadow-sm"
                      style={{ height: `${totalHeight}%` }}
                    >
                      {/* Top part: Pontual (Light sage/mint) */}
                      <div
                        className="w-full bg-[#b4d4cb] transition-all"
                        style={{ height: `${pontShare}%` }}
                        title={`Pontual: R$ ${item.pontual}`}
                      />
                      {/* Bottom part: Recorrente (Deep pine green) */}
                      <div
                        className="w-full bg-[#0b5344] transition-all"
                        style={{ height: `${recShare}%` }}
                        title={`Recorrente: R$ ${item.recorrente}`}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="mt-3 text-xs font-semibold text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card: Precisa da sua atenção (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Precisa da sua atenção</h2>
          </div>

          <p className="text-xs text-slate-500">
            Pendências operacionais e oportunidades de engajamento da régua
          </p>

          <div className="space-y-3 pt-2">
            {data.attentionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.actionTab === 'donors') onNavigateTab('doadores', 'ready');
                  else if (item.actionTab === 'vault') onNavigateTab('cofre');
                  else onNavigateTab('prestacao');
                }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.type === 'INVITE_READY'
                        ? 'bg-amber-500'
                        : item.type === 'FAILED_RECURRING'
                        ? 'bg-rose-500'
                        : 'bg-orange-500'
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 transition-colors">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('doadores')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors inline-flex items-center gap-1"
            >
              <span>Ver todos os 87 doadores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

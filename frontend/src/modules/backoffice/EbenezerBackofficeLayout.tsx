import React, { useState } from 'react';
import { DashboardV2Page } from './DashboardV2Page';
import { DonorsListPage } from './DonorsListPage';
import { DonorDetailPage } from './DonorDetailPage';
import { RelationshipRulePage } from './RelationshipRulePage';
import { IndicatorsVaultPage } from './IndicatorsVaultPage';
import { ExceptionsPage } from './ExceptionsPage';
import { BarChart3, Users, GitFork, KeyRound, FileSpreadsheet, LogOut, ChevronRight, Menu, X } from 'lucide-react';

interface EbenezerBackofficeLayoutProps {
  token: string;
  userRole?: string;
  onLogout: () => void;
  onExitToPublic?: () => void;
}

export type BackofficeTab = 'painel' | 'doadores' | 'regua' | 'cofre' | 'prestacao';

export const EbenezerBackofficeLayout: React.FC<EbenezerBackofficeLayoutProps> = ({
  token,
  userRole,
  onLogout,
  onExitToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<BackofficeTab>('painel');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [donorFilter, setDonorFilter] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigate to tab, optionally setting filter or resetting donor detail
  const handleNavigateTab = (tab: BackofficeTab, filter?: string) => {
    setActiveTab(tab);
    setDonorFilter(filter);
    setSelectedDonorId(null);
    setMobileMenuOpen(false);
  };

  const handleSelectDonor = (donorId: string) => {
    setSelectedDonorId(donorId);
  };

  const navItems: Array<{ id: BackofficeTab; label: string; icon: React.ReactNode }> = [
    { id: 'painel', label: 'Painel', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'doadores', label: 'Doadores', icon: <Users className="w-4 h-4" /> },
    { id: 'regua', label: 'Régua', icon: <GitFork className="w-4 h-4" /> },
    { id: 'cofre', label: 'Cofre de números', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'prestacao', label: 'Prestação de contas', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const userInitials = userRole === 'COMMUNICATION' ? 'MC' : userRole === 'FINANCE' ? 'FS' : 'CS';
  const userName = userRole === 'COMMUNICATION' ? 'Mariana C.' : userRole === 'FINANCE' ? 'Fabio S.' : 'Cláudia S.';
  const userRoleLabel = userRole === 'COMMUNICATION' ? 'Comunicação' : userRole === 'FINANCE' ? 'Financeiro' : 'Coordenação';

  return (
    <div className="min-h-screen bg-[#EFF3F8] flex flex-col md:flex-row text-slate-800 antialiased -mx-4 -my-4 md:-mx-8 md:-my-8">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#101625] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <img src="/logo-white.svg" alt="Instituto Social Ebenézer" className="h-7 w-auto" />
          <span className="text-[10px] text-[#00FB00] font-bold tracking-widest block uppercase">
            RECORRENTE
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Fiel ao Design System Oficial Ebenézer (#101625 / Midnight Navy & #00FB00) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#101625] text-slate-200 flex flex-col justify-between z-50 transition-transform duration-300 shadow-2xl border-r border-slate-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          {/* Logo Oficial Ebenézer */}
          <div className="pb-6 border-b border-white/10">
            <img src="/logo-white.svg" alt="Instituto Social Ebenézer" className="h-9 w-auto" />
            <span className="text-[9px] text-[#00FB00] font-black tracking-widest block uppercase mt-2">
              PLATAFORMA RECORRENTE
            </span>
          </div>

          {/* Menus de Navegação */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1E2538] text-white shadow-sm font-bold border-l-4 border-[#00FB00]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#00FB00]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00FB00]" />}
                </button>
              );
            })}

            {onExitToPublic && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <button
                  onClick={onExitToPublic}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span>← Portal de Doação Público</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Perfil do Operador com Design Ebenézer */}
        <div className="p-4 border-t border-white/10 bg-[#141B2D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00FB00]/20 border border-[#00FB00]/50 text-[#00FB00] font-bold text-xs flex items-center justify-center">
                {userInitials}
              </div>
              <div>
                <span className="font-bold text-white text-xs block leading-tight">{userName}</span>
                <span className="text-[10px] text-[#00FB00] block font-medium">{userRoleLabel}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Encerrar sessão"
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'painel' && (
          <DashboardV2Page token={token} onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'doadores' && (
          selectedDonorId ? (
            <DonorDetailPage
              token={token}
              donorId={selectedDonorId}
              onBack={() => setSelectedDonorId(null)}
            />
          ) : (
            <DonorsListPage
              token={token}
              initialFilter={donorFilter}
              onSelectDonor={handleSelectDonor}
            />
          )
        )}

        {activeTab === 'regua' && <RelationshipRulePage token={token} />}

        {activeTab === 'cofre' && (
          <IndicatorsVaultPage token={token} onBack={() => handleNavigateTab('painel')} />
        )}

        {activeTab === 'prestacao' && (
          <ExceptionsPage token={token} onBack={() => handleNavigateTab('painel')} />
        )}
      </main>
    </div>
  );
};

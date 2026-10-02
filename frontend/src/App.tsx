import { useState } from 'react';
import { DonationForm } from './modules/checkout/DonationForm';
import { PixPaymentScreen } from './modules/checkout/PixPaymentScreen';
import { DonationSuccessScreen } from './modules/checkout/DonationSuccessScreen';
import { LoginPage } from './modules/backoffice/LoginPage';
import { EbenezerBackofficeLayout } from './modules/backoffice/EbenezerBackofficeLayout';
import { TransparencyPage } from './modules/transparency/TransparencyPage';
import { DonorPortalPage } from './modules/donor/DonorPortalPage';
import { UxFlowJourneyPage } from './modules/ux/UxFlowJourneyPage';
import { PrivacyLgpdPage } from './modules/privacy/PrivacyLgpdPage';
import { CheckoutResponse } from './services/api';
import { Lock, LogOut, GitBranch } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'transparency' | 'donor' | 'admin' | 'ux' | 'privacy'>('checkout');

  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'pix' | 'success'>('form');
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [paidDate, setPaidDate] = useState<string | null>(null);

  // Admin flow states
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  const handleCheckoutSuccess = (data: CheckoutResponse) => {
    setCheckoutData(data);
    if (data.status === 'PAID') {
      setPaidDate(new Date().toISOString());
      setCheckoutStep('success');
    } else {
      setCheckoutStep('pix');
    }
  };

  const handlePaymentConfirmed = (paidAt?: string | null) => {
    setPaidDate(paidAt || null);
    setCheckoutStep('success');
  };

  const handleResetCheckout = () => {
    setCheckoutData(null);
    setPaidDate(null);
    setCheckoutStep('form');
  };

  const handleAdminLogin = (token: string, role: string) => {
    setAdminToken(token);
    setAdminRole(role);
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminRole(null);
  };

  if (activeTab === 'admin' && adminToken) {
    return (
      <EbenezerBackofficeLayout
        token={adminToken}
        userRole={adminRole || undefined}
        onLogout={handleLogout}
        onExitToPublic={() => setActiveTab('checkout')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-[#2C394C] font-montserrat">
      {/* Barra de Navegação Oficial - Design System Ebenézer */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer py-1" onClick={() => setActiveTab('checkout')}>
            <img
              src="/logo.svg"
              alt="Logo do Instituto Ebenezer"
              width="200"
              height="38"
              className="w-[170px] sm:w-[200px] h-auto object-contain"
            />
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-4 sm:px-5 py-2 rounded-[300px] text-xs sm:text-sm font-bold transition-all shadow-xs ${
                activeTab === 'checkout'
                  ? 'bg-[#00FB00] text-[#101625] ring-2 ring-[#00DB00]'
                  : 'bg-[#00FB00] hover:bg-[#00DB00] text-[#101625] hover:-translate-y-0.5'
              }`}
            >
              Doe Agora
            </button>

            <button
              onClick={() => setActiveTab('transparency')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                activeTab === 'transparency'
                  ? 'bg-[#EFF3F8] text-[#101625] font-bold shadow-xs'
                  : 'text-[#2C394C] hover:text-[#101625] hover:bg-slate-100'
              }`}
            >
              <span>Transparência</span>
            </button>

            <button
              onClick={() => setActiveTab('donor')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                activeTab === 'donor'
                  ? 'bg-[#EFF3F8] text-[#101625] font-bold shadow-xs'
                  : 'text-[#2C394C] hover:text-[#101625] hover:bg-slate-100'
              }`}
            >
              <span>Área do Doador</span>
            </button>

            <button
              onClick={() => setActiveTab('ux')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 ${
                activeTab === 'ux'
                  ? 'bg-[#101625] text-white font-bold shadow-xs'
                  : 'text-[#2C394C] hover:text-[#101625] hover:bg-slate-100'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-[#00FB00]" />
              <span className="hidden md:inline">Mapeamento UX</span>
              <span className="md:hidden">UX</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#101625] text-white shadow-xs'
                  : 'text-[#2C394C] hover:text-[#101625] hover:bg-slate-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#00FB00]" />
              <span className="hidden sm:inline">Back-office</span>
            </button>

            {adminToken && activeTab === 'admin' && (
              <button
                onClick={handleLogout}
                title="Sair do painel"
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'checkout' && (
          <div>
            {checkoutStep === 'form' && <DonationForm onSuccess={handleCheckoutSuccess} />}
            {checkoutStep === 'pix' && checkoutData && (
              <PixPaymentScreen
                checkoutData={checkoutData}
                onPaymentConfirmed={handlePaymentConfirmed}
                onCancel={handleResetCheckout}
              />
            )}
            {checkoutStep === 'success' && checkoutData && (
              <DonationSuccessScreen
                amount={checkoutData.amount}
                paidAt={paidDate}
                paymentMethod={checkoutData.paymentMethod}
                frequency={checkoutData.frequency}
                cardBrand={checkoutData.cardBrand}
                cardLast4={checkoutData.cardLast4}
                onReset={handleResetCheckout}
                onNavigateToDonorPortal={() => setActiveTab('donor')}
                onNavigateToTransparency={() => setActiveTab('transparency')}
              />
            )}
          </div>
        )}

        {activeTab === 'transparency' && <TransparencyPage />}

        {activeTab === 'donor' && <DonorPortalPage />}

        {activeTab === 'ux' && (
          <UxFlowJourneyPage onNavigateToTab={(tab) => setActiveTab(tab as any)} />
        )}

        {activeTab === 'privacy' && (
          <PrivacyLgpdPage onNavigateToTab={(tab) => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        )}

        {activeTab === 'admin' && !adminToken && (
          <LoginPage onLoginSuccess={handleAdminLogin} />
        )}
      </main>

      {/* Rodapé Oficial (Design System https://www.institutosocialebenezer.com.br/) */}
      <footer className="w-full px-6 sm:px-12 py-10 bg-[#101625] text-white rounded-tl-[30px] rounded-tr-[30px] mt-12 font-montserrat space-y-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
          <div>
            <img
              src="/logo-white.svg"
              alt="Logo do Instituto Ebenezer"
              width="210"
              height="40"
              className="w-[180px] sm:w-[210px] h-auto object-contain brightness-0 invert"
            />
            <p className="text-xs text-slate-300 mt-2 max-w-md leading-relaxed">
              Investimos na infância para criar oportunidades reais e transformar futuros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium text-slate-300">
            <button onClick={() => { setActiveTab('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#00FB00] transition-colors">Doe Agora</button>
            <button onClick={() => { setActiveTab('transparency'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#00FB00] transition-colors">Transparência</button>
            <button onClick={() => { setActiveTab('donor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#00FB00] transition-colors">Área do Doador</button>
            <button onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`hover:text-[#00FB00] transition-colors ${activeTab === 'privacy' ? 'text-[#00FB00] font-bold' : ''}`}>Privacidade & LGPD</button>
            <button onClick={() => { setActiveTab('ux'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#00FB00] transition-colors">Mapeamento UX</button>
            <a href="https://forms.gle/3EkchJz5exqvdbJq6" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FB00] transition-colors">Canal de Denúncia ↗</a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-slate-400">
          <div>
            <p className="font-semibold text-white">Instituto de Cultura e Lazer Ebenézer. CNPJ: 30.434.044/0001-90</p>
            <p className="mt-0.5">R. José Ribeiro Ramos, 31 - Jardim Angela, São Paulo - SP, 05878-110</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#00FB00] text-[#00FB00] font-semibold transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
              title="Conheça nossa Política de Privacidade & LGPD"
            >
              Privacidade & LGPD Garantidas
            </button>
            <span>•</span>
            <span>Segurança Pix Bacen & Cartão PCI-DSS</span>
            <span>•</span>
            <span>Sem fins lucrativos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

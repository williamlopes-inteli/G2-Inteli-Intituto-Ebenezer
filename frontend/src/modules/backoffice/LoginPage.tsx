import React, { useState } from 'react';
import { api } from '../../services/api';
import { Lock, Shield } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('claudia@ebenezer.org.br');
  const [password, setPassword] = useState<string>('coord123');
  const [mfaCode, setMfaCode] = useState<string>('123456');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.loginAdmin({ email, password, mfaCode });
      onLoginSuccess(res.token, res.user.role);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto p-6 md:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#082f25] rounded-xl flex items-center justify-center mx-auto text-emerald-400">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ebenézer Recorrente</h2>
        <p className="text-xs text-slate-500">Painel de Gestão de Doadores, Régua e Transparência</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Corporativo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-700">Código de 2 Fatores (MFA)</label>
            <span className="text-[10px] text-slate-400">Padrão teste: 123456</span>
          </div>
          <input
            type="text"
            required
            placeholder="123456"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#082f25] hover:bg-[#051f18] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-emerald-950/20"
        >
          {loading ? 'Verificando...' : (
            <>
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Acessar Painel</span>
            </>
          )}
        </button>
      </form>

      {/* Preenchimento Rápido por Perfil (Atalho para Testes do PRD) */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Selecionar Perfil de Teste (1 Clique):
        </label>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setEmail('claudia@ebenezer.org.br');
              setPassword('coord123');
              setMfaCode('123456');
            }}
            className="col-span-2 p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-left transition-all"
          >
            <strong className="block text-[#082f25]">✨ Cláudia S. · Coordenação (Design Oficial)</strong>
            <span className="text-[10px] text-emerald-800">Painel, Doadores, Linha do Tempo & LGPD</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('comunicacao@ebenezer.org.br');
              setPassword('com123');
              setMfaCode('123456');
            }}
            className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all"
          >
            <strong className="block text-slate-800">📣 Comunicação</strong>
            <span className="text-[10px] text-slate-500">Maker de Indicadores</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('aprovador@ebenezer.org.br');
              setPassword('apr123');
              setMfaCode('123456');
            }}
            className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all"
          >
            <strong className="block text-slate-800">🛡️ Aprovador</strong>
            <span className="text-[10px] text-slate-500">Checker Maker-Checker</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('financeiro@ebenezer.org.br');
              setPassword('fin123');
              setMfaCode('123456');
            }}
            className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all"
          >
            <strong className="block text-slate-800">💼 Financeiro</strong>
            <span className="text-[10px] text-slate-500">Conciliação & Exceções</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('admin@ebenezer.org.br');
              setPassword('admin123');
              setMfaCode('123456');
            }}
            className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all"
          >
            <strong className="block text-slate-800">⚙️ Administrador</strong>
            <span className="text-[10px] text-slate-500">Acesso Geral</span>
          </button>
        </div>
      </div>
    </div>
  );
};

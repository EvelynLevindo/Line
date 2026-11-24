import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Heart, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthView() {
  const { login, signup } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome ou como prefere ser chamada.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve conter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Verifique e tente novamente.');
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await signup(email.trim(), password, name.trim());
      } else {
        res = await login(email.trim(), password);
      }

      if (!res.success) {
        setErrorMessage(res.error || 'Ocorreu um erro. Tente novamente.');
      }
    } catch (err) {
      setErrorMessage('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8f7] flex flex-col justify-center items-center px-4 py-8 selection:bg-[#fe6a7b]/30">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-xl border border-[#ffe8ec] flex flex-col gap-6">
        {/* App Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7e001d] to-[#fe6a7b] text-white flex items-center justify-center shadow-md mb-3">
            <span className="text-2xl select-none">🌸</span>
          </div>
          <h1 className="text-2xl font-bold text-[#7e001d] tracking-tight">Line</h1>
          <p className="text-xs text-[#5a4040] mt-1 font-medium">
            Aura Ciclo • Saúde Feminina Segura & Privada
          </p>
        </div>

        {/* Tab switch Login / Cadastro */}
        <div className="flex bg-[#fff0f2] p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isRegister
                ? 'bg-white text-[#7e001d] shadow-xs'
                : 'text-[#5a4040] hover:text-[#7e001d]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isRegister
                ? 'bg-white text-[#7e001d] shadow-xs'
                : 'text-[#5a4040] hover:text-[#7e001d]'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-3 flex items-start gap-2.5 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
                Seu Nome
              </label>
              <div className="flex items-center bg-[#fff0f2] border border-[#e2bebe] rounded-2xl px-3.5 py-2.5 gap-2.5 focus-within:ring-2 focus-within:ring-[#7e001d]">
                <User className="w-4 h-4 text-[#8e7070]" />
                <input
                  type="text"
                  required
                  placeholder="Como prefere ser chamada"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
              E-mail
            </label>
            <div className="flex items-center bg-[#fff0f2] border border-[#e2bebe] rounded-2xl px-3.5 py-2.5 gap-2.5 focus-within:ring-2 focus-within:ring-[#7e001d]">
              <Mail className="w-4 h-4 text-[#8e7070]" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
              Senha
            </label>
            <div className="flex items-center bg-[#fff0f2] border border-[#e2bebe] rounded-2xl px-3.5 py-2.5 gap-2.5 focus-within:ring-2 focus-within:ring-[#7e001d]">
              <Lock className="w-4 h-4 text-[#8e7070]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-[#5a4040] uppercase tracking-wider block mb-1">
                Confirmar Senha
              </label>
              <div className="flex items-center bg-[#fff0f2] border border-[#e2bebe] rounded-2xl px-3.5 py-2.5 gap-2.5 focus-within:ring-2 focus-within:ring-[#7e001d]">
                <Lock className="w-4 h-4 text-[#8e7070]" />
                <input
                  type="password"
                  required
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-full bg-[#7e001d] hover:bg-[#920023] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-60"
          >
            <span>{loading ? 'Processando...' : isRegister ? 'Criar Minha Conta' : 'Acessar Conta'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Privacy Note */}
        <div className="text-center">
          <p className="text-[11px] text-[#5a4040] leading-relaxed">
            Seus dados são individuais e protegidos. Nenhum dado é vendido ou compartilhado com redes de publicidade.
          </p>
        </div>
      </div>
    </div>
  );
}

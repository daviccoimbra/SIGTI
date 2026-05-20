import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { FiUser, FiLock } from "react-icons/fi";
import axios from "axios";

type LoginFormData = {
  login: string;
  senha: string;
};

export default function Login() {
  const { showMessage } = useToast();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginFormData>();

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chamados", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isAuthenticated) return null;

  const handleLogin = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      await login({
        username: data.login,
        password: data.senha,
      });
      showMessage("Login realizado com sucesso!", "success");
      navigate("/chamados");
    } catch (error) {
      let msg = "Erro ao fazer login. Tente novamente.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.error || msg;
      }
      showMessage(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-gradient-to-bl from-indigo-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3988' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Login Card */}
      <div 
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08),0_2px_8px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3988] to-[#2563eb] shadow-lg shadow-blue-500/25 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 
              className="text-3xl sm:text-4xl font-bold text-[#1e3988] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SIGTI
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Sistema de Gestão de Chamados de TI
            </p>
          </div>

          <form onSubmit={handleSubmitLogin(handleLogin)} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label 
                className="text-sm font-semibold text-slate-700"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Usuário
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="w-5 h-5 text-slate-400 group-focus-within:text-[#1e3988] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Digite seu usuário"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1e3988] focus:ring-4 focus:ring-[#1e3988]/10 transition-all duration-200"
                  {...registerLogin("login", { required: true })}
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#1e3988] to-[#2563eb] opacity-0 group-focus-within:opacity-100 transition-opacity rounded-b-xl" />
              </div>
              {errorsLogin.login && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Campo obrigatório
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                className="text-sm font-semibold text-slate-700"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="w-5 h-5 text-slate-400 group-focus-within:text-[#1e3988] transition-colors" />
                </div>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="w-full pl-12 pr-14 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1e3988] focus:ring-4 focus:ring-[#1e3988]/10 transition-all duration-200"
                  {...registerLogin("senha", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <IoEye className="w-5 h-5" />
                  ) : (
                    <IoEyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errorsLogin.senha && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Campo obrigatório
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-[#1e3988] to-[#2563eb] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className={`relative z-10 flex items-center justify-center gap-2 ${submitting ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar
              </span>
              {submitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#1e40af] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © 2024 SIGTI - Sistema de Gestão de Chamados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
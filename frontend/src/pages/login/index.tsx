import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import axios from "axios";

type LoginFormData = {
  login: string;
  senha: string;
};

export default function Login() {
  const { showMessage } = useToast();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    <div
      className="w-full h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='bg' x='0' y='0' width='400' height='400' patternUnits='userSpaceOnUse'%3E%3Cpath d='M-100 100 L300 -300 M0 400 L400 0 M100 500 L500 100' stroke='%23e2e8f0' stroke-width='1' fill='none' opacity='0.5'/%3E%3Cpath d='M-100 -100 L300 300 M0 -100 L400 300 M100 -200 L500 200' stroke='%23e2e8f0' stroke-width='1' fill='none' opacity='0.5'/%3E%3Cpath d='M200 0 L400 200 L200 400 L0 200 Z' stroke='%23cbd5e1' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3C/svg%3E")`,
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md mx-4 relative z-10 border border-slate-100">
        
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-black text-blue-950 tracking-tight">
            SIGTI
          </h1>
          <p className="text-sm text-gray-700 mt-2 text-center">
            Sistema de Gestão de Chamados de TI
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmitLogin(handleLogin)}
        >
          <div className="flex flex-col">
            <label className="text-sm font-bold text-blue-950 mb-1">
              Usuário:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400 text-lg" />
              </div>
              <input
                className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                type="text"
                placeholder="Insira seu usuário"
                {...registerLogin("login", { required: true })}
              />
            </div>
            {errorsLogin.login && (
              <span className="text-xs text-red-500 mt-1 font-medium">
                Campo obrigatório
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-blue-950 mb-1">
              Senha:
            </label>
            <div className="relative">
              <input
                className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Insira sua senha"
                {...registerLogin("senha", { required: true })}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <IoEye size={20} /> : <IoEyeOff size={20} />}
              </button>
            </div>
            {errorsLogin.senha && (
              <span className="text-xs text-red-500 mt-1 font-medium">
                Campo obrigatório
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-950 transition-colors py-3 mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

      </div>
    </div>
  );
}
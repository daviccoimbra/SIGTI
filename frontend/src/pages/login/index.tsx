import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "../../context/toastContext";
import { IoEyeOff, IoEye } from "react-icons/io5";

type LoginFormData = {
  login: string;
  senha: string;
};

type RegisterFormData = {
  email: string;
  senha: string;
  confirmarSenha: string;
};

export default function Login() {
  const { showMessage } = useToast()
  const [cadastro, setCadastro] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
    reset: resetLogin,
  } = useForm<LoginFormData>();

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: errorsRegister },
    reset: resetRegister,
  } = useForm<RegisterFormData>();

  const { login, token } = useAuth();
  const navigate = useNavigate();

  if (token) {
    navigate("/chamados");
  }

  const handleLogin = async (data: LoginFormData) => {
    await login(data);
    navigate("/");
  };

  const handleRegister = async (data: RegisterFormData) => {
    if (data.senha !== data.confirmarSenha) {
      showMessage("Senhas não conferem!", "error")
      return;
    }
    setCadastro(false);
    resetRegister();
  };

  const toggle = () => {
    setCadastro(!cadastro);
    resetLogin();
    resetRegister();
  };

  return (
    <div
      className="w-screen h-screen flex">
      <div
        className="flex flex-col h-screen w-[50%] md:w-[30%] border-r shadow-xl justify-center items-center p-5">
        {cadastro ? (
          // FORMULÁRIO DE CADASTRO
          <>
            <form
              className="flex flex-col w-full"
              onSubmit={handleSubmitRegister(handleRegister)}
            >
              <label
                className="pt-2 text-[10px] font-bold">
                Usuário:
              </label>
              <input
                className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
                type="text"
                placeholder="Insira seu Email"
                {...registerRegister("email", { required: true })}
              />
              {errorsRegister.email && (
                <span
                  className="text-[10px] text-red-500">
                  Campo obrigatório
                </span>
              )}

              <label
                className="pt-2 text-[10px] font-bold">
                Senha:
              </label>
              <input
                className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
                type="password"
                placeholder="Insira sua senha"
                {...registerRegister("senha", { required: true })}
              />
              {errorsRegister.senha && (
                <span
                  className="text-[10px] text-red-500">
                  Campo obrigatório
                </span>
              )}

              <label
                className="pt-2 text-[10px] font-bold">
                Confirmar senha:
              </label>
              <div className="relative">
                <input
                  className="w-full p-2 pr-10 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  {...registerRegister("confirmarSenha", { required: true })}
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {mostrarSenha ? <IoEye size={18} /> : <IoEyeOff size={18} />}
                </button>
              </div>
              {errorsRegister.confirmarSenha && (
                <span
                  className="text-[10px] text-red-500">
                  Campo obrigatório
                </span>
              )}

              <input
                type="submit"
                className="mt-2 border rounded-lg w-full bg-[#2563eb] text-white font-bold hover:bg-[#2563eb]/50 transition duration-200"
                value="Registrar"
              />
            </form>

            <div
              className="flex flex-row">
              <span
                className="text-[13px] text-gray-500">
                Já possui uma conta?{" "}
                <span
                  onClick={toggle}
                  className="cursor-pointer text-blue-900 font-bold hover:underline"
                >
                  Acessar
                </span>
              </span>
            </div>
          </>
        ) : (
          // FORMULÁRIO DE LOGIN
          <>
            <form
              className="flex flex-col w-full"
              onSubmit={handleSubmitLogin(handleLogin)}
            >
              <label
                className="pt-2 text-[10px] font-bold">
                Usuário:
              </label>
              <input
                className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
                type="text"
                placeholder="Insira seu Email"
                {...registerLogin("login", { required: true })}
              />
              {errorsLogin.login && (
                <span
                  className="text-[10px] text-red-500">
                  Campo obrigatório
                </span>
              )}

              <label className="pt-2 text-[10px] font-bold">
                Senha:
              </label>

              <div className="relative">
                <input
                  className="w-full p-2 pr-10 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Insira sua senha"
                  {...registerLogin("senha", { required: true })}
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {mostrarSenha ? <IoEye size={18} /> : <IoEyeOff size={18} />}
                </button>
              </div>

              {errorsLogin.senha && (
                <span className="text-[10px] text-red-500">
                  Campo obrigatório
                </span>
              )}

              <input
                type="submit"
                className="mt-2 border rounded-lg w-full bg-[#2563eb] text-white font-bold hover:bg-[#2563eb]/50 transition duration-200"
                value="Entrar"
              />
            </form>

            <div
              className="flex flex-row">
              <span
                className="text-[13px] text-gray-500">
                Não possui uma conta?{" "}
                <span
                  onClick={toggle}
                  className="cursor-pointer text-blue-900 font-bold hover:underline"
                >
                  Cadastre-se
                </span>
              </span>
            </div>
          </>
        )}
      </div>
      <img
        src="/backgoundlogin.png"
        className="w-full h-full opacity-[0.5]"
        alt="tema plano de fundo" />
    </div>
  );
}
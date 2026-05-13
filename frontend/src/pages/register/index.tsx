import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { useToast } from "../../context/toastContext";
import api from "../../services/api";
import type { Setor } from "../../services/auth";

interface RegisterFormData {
  username: string;
  password: string;
  confirmarSenha: string;
  nome: string;
  setor: Setor;
}

type UserRow = {
  id: string;
  username: string;
  nome: string;
  setor: Setor;
};

const RegisterUser = () => {
  const { showMessage } = useToast();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usuariosCriados, setUsuariosCriados] = useState<UserRow[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const senha = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmarSenha) {
      showMessage("As senhas não conferem!", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        username: data.username,
        password: data.password,
        nome: data.nome,
        setor: data.setor,
      });

      const novoUsuario: UserRow = response.data;
      setUsuariosCriados((prev) => [novoUsuario, ...prev]);

      showMessage(`Usuário "${novoUsuario.username}" criado com sucesso!`, "success");
      reset();
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || "Erro ao cadastrar usuário. Tente novamente.";
      showMessage(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const setores: { value: Setor; label: string; cor: string }[] = [
    { value: "ADMIN", label: "Administração", cor: "bg-purple-100 text-purple-800 border-purple-300" },
    { value: "GESTAO", label: "Gestão", cor: "bg-blue-100 text-blue-800 border-blue-300" },
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-[#f8f9fa] pb-5 min-h-full">
      <h1 className="text-2xl mb-2 text-bold mt-4 font-bold">
        Cadastrar Usuário
      </h1>

      <p className="text-[13px] text-gray-600 mb-5">
        Preencha os dados abaixo para criar um novo acesso ao sistema
      </p>

      <form
        className="flex justify-items-start w-[60%] md:w-[40%] bg-[#fff] p-6 shadow rounded-lg border-[2px] pb-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col w-full">
          {/* Nome Completo */}
          <div className="flex flex-col">
            <label className="text-[15px] mb-2 font-bold">
              Nome Completo*
            </label>
            <input
              className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
              placeholder="Ex: João da Silva"
              disabled={submitting}
              {...register("nome", { required: true })}
            />
            {errors.nome && (
              <span className="text-[13px] text-red-500">
                Campo Obrigatório!
              </span>
            )}
          </div>

          {/* Nome de Usuário */}
          <div className="flex flex-col">
            <label className="text-[15px] mt-4 mb-2 font-bold">
              Nome de Usuário*
            </label>
            <input
              className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
              placeholder="Ex: joao.silva"
              disabled={submitting}
              {...register("username", {
                required: true,
                minLength: { value: 3, message: "Mínimo de 3 caracteres" },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+$/,
                  message: "Apenas letras, números, pontos, hífens e underlines",
                },
              })}
            />
            {errors.username && (
              <span className="text-[13px] text-red-500">
                {errors.username.message || "Campo Obrigatório!"}
              </span>
            )}
          </div>

          {/* Setor */}
          <div className="flex flex-col">
            <label className="text-[15px] mt-4 mb-2 font-bold">
              Setor*
            </label>
            <div className="flex flex-wrap gap-2">
              {setores.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer border rounded-lg transition-all text-[13px] font-bold
                    has-[:checked]:${s.cor.split(" ").join(" has-[:checked]:")}
                    has-[:checked]:border-2
                    hover:shadow-sm
                  `}
                >
                  <input
                    type="radio"
                    value={s.value}
                    className="sr-only"
                    {...register("setor", { required: true })}
                  />
                  <span>{s.value}</span>
                  <span className="text-[11px] font-normal text-gray-500">
                    ({s.label})
                  </span>
                </label>
              ))}
            </div>
            {errors.setor && (
              <span className="text-[13px] text-red-500">
                Selecione um setor!
              </span>
            )}
          </div>

          {/* Senha */}
          <div className="flex flex-col">
            <label className="text-[15px] mt-4 mb-2 font-bold">
              Senha*
            </label>
            <div className="relative">
              <input
                className="w-full p-2 pr-10 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                disabled={submitting}
                {...register("password", {
                  required: true,
                  minLength: { value: 6, message: "Mínimo de 6 caracteres" },
                })}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {mostrarSenha ? <IoEye size={18} /> : <IoEyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[13px] text-red-500">
                {errors.password.message || "Campo Obrigatório!"}
              </span>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="flex flex-col">
            <label className="text-[15px] mt-4 mb-2 font-bold">
              Confirmar Senha*
            </label>
            <input
              className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Repita a senha"
              disabled={submitting}
              {...register("confirmarSenha", {
                required: true,
                validate: (value) =>
                  value === senha || "As senhas não conferem",
              })}
            />
            {errors.confirmarSenha && (
              <span className="text-[13px] text-red-500">
                {errors.confirmarSenha.message || "Campo Obrigatório!"}
              </span>
            )}
          </div>

          {/* Botões */}
          <div className="w-full mt-6 flex flex-col gap-2 md:flex-row md:justify-between md:h-[40px]">
            <button
              type="submit"
              disabled={submitting}
              className="border rounded-lg w-full md:w-[70%] bg-[#2563eb] text-white font-bold hover:bg-[#2563eb]/80 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed py-2"
            >
              {submitting ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>

            <button
              type="button"
              onClick={() => reset()}
              className="bg-gray-300 w-full md:w-[25%] rounded-lg font-bold hover:bg-gray-300/50 py-2"
            >
              Limpar
            </button>
          </div>
        </div>
      </form>

      {/* Lista de usuários recém-criados */}
      {usuariosCriados.length > 0 && (
        <div className="w-[60%] md:w-[40%] mt-6 bg-white shadow rounded-lg border-[2px] p-4">
          <h2 className="text-[15px] font-bold mb-3 text-gray-700">
            Usuários criados nesta sessão
          </h2>
          <div className="flex flex-col gap-2">
            {usuariosCriados.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-gray-800">
                    {u.nome}
                  </span>
                  <span className="text-[12px] text-gray-500">
                    @{u.username}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    u.setor === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {u.setor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;

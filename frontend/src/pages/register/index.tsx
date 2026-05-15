import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoEyeOff, IoEye } from "react-icons/io5";
import {
  MdPersonAdd,
  MdPerson,
  MdAccountCircle,
  MdBadge,
  MdLock,
  MdSave,
  MdCancel,
} from "react-icons/md";
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
  const [setorSelecionado, setSetorSelecionado] = useState<Setor | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      setSetorSelecionado(null);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || "Erro ao cadastrar usuário. Tente novamente.";
      showMessage(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const setores: { value: Setor; label: string; activeClass: string; inactiveClass: string }[] = [
    {
      value: "ADMIN",
      label: "Administração",
      activeClass: "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200",
      inactiveClass: "text-purple-600 hover:bg-purple-50 border-purple-200 bg-white",
    },
    {
      value: "GESTAO",
      label: "Gestão",
      activeClass: "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200",
      inactiveClass: "text-blue-600 hover:bg-blue-50 border-blue-200 bg-white",
    },
  ];

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-sm";
  const labelClass = "text-sm font-semibold text-gray-700 flex items-center gap-2";

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-8 pt-7 pb-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200">
            <MdPersonAdd className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Cadastrar Usuário
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Preencha os dados abaixo para criar um novo acesso ao sistema
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <MdAccountCircle className="text-xl" />
                Dados do Usuário
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Nome Completo */}
                <div className="md:col-span-2">
                  <label className={`${labelClass} mb-2 block`}>
                    <MdPerson className="text-indigo-600" />
                    Nome Completo *
                  </label>
                  <input
                    className={`${inputClass} ${errors.nome ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                    placeholder="Ex: João da Silva"
                    disabled={submitting}
                    {...register("nome", { required: true })}
                  />
                  {errors.nome && (
                    <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>
                  )}
                </div>

                {/* Nome de Usuário */}
                <div>
                  <label className={`${labelClass} mb-2 block`}>
                    <MdAccountCircle className="text-indigo-600" />
                    Nome de Usuário *
                  </label>
                  <input
                    className={`${inputClass} ${errors.username ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
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
                    <span className="text-red-500 text-xs mt-1">
                      {errors.username.message || "Campo obrigatório!"}
                    </span>
                  )}
                </div>

                {/* Setor */}
                <div>
                  <label className={`${labelClass} mb-2 block`}>
                    <MdBadge className="text-indigo-600" />
                    Setor *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {setores.map((s) => {
                      const isSelected = setorSelecionado === s.value;
                      return (
                        <label
                          key={s.value}
                          className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 text-center
                            ${s.value === "ADMIN" && isSelected ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200" : ""}
                            ${s.value === "ADMIN" && !isSelected ? "text-purple-600 hover:bg-purple-50 border-purple-200 bg-white" : ""}
                            ${s.value === "GESTAO" && isSelected ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : ""}
                            ${s.value === "GESTAO" && !isSelected ? "text-blue-600 hover:bg-blue-50 border-blue-200 bg-white" : ""}
                          `}
                        >
                          <input
                            type="radio"
                            value={s.value}
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => {
                              setSetorSelecionado(s.value);
                              setValue("setor", s.value);
                            }}
                          />
                          <div>
                            <div>{s.value}</div>
                            <div className="text-[11px] font-normal opacity-75">{s.label}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {errors.setor && (
                    <span className="text-red-500 text-xs mt-1">Selecione um setor!</span>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <label className={`${labelClass} mb-2 block`}>
                    <MdLock className="text-indigo-600" />
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-10 ${errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {mostrarSenha ? <IoEye size={18} /> : <IoEyeOff size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.password.message || "Campo obrigatório!"}
                    </span>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className={`${labelClass} mb-2 block`}>
                    <MdLock className="text-indigo-600" />
                    Confirmar Senha *
                  </label>
                  <input
                    className={`${inputClass} ${errors.confirmarSenha ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
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
                    <span className="text-red-500 text-xs mt-1">
                      {errors.confirmarSenha.message || "Campo obrigatório!"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => { reset(); setSetorSelecionado(null); }}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MdSave className="text-lg" />
              {submitting ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>

        {/* Lista de usuários criados */}
        {usuariosCriados.length > 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <MdPersonAdd className="text-xl" />
                  Usuários criados nesta sessão
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {usuariosCriados.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                        <MdPerson className="text-indigo-600" size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {u.nome}
                        </span>
                        <span className="text-xs text-gray-400 block">
                          @{u.username}
                        </span>
                      </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterUser;

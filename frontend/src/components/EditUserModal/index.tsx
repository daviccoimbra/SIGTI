import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { MdClose } from "react-icons/md"
import { useToast } from "../../hooks/useToast"
import { updateUser } from "../../services/users"
import type { UserT } from "../../types"


interface Props {
  isOpen: boolean
  user: UserT | null
  onClose: () => void
  onUpdate: () => void
}

interface UserFormData {
  nome: string
  email: string
  departamento: string
  cargo: string
  setor: 'ADMIN' | 'GESTAO'
  ativo: boolean
}

const EditUserModal = ({ isOpen, user, onClose, onUpdate }: Props) => {
  const { showMessage } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>()

  useEffect(() => {
    if (user) {
      reset({
        nome: user.nome,
        email: user.email || '',
        departamento: user.departamento || '',
        cargo: user.cargo || '',
        setor: user.setor,
        ativo: user.ativo,
      })
    }
  }, [user, reset])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", esc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", esc)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  const onSubmit = async (data: UserFormData) => {
    if (!user) return
    try {
      await updateUser(user.id, data)
      showMessage("Usuário atualizado com sucesso!", "success")
      onUpdate()
      onClose()

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      showMessage("Erro ao atualizar usuário", "error")
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Editar Usuário
            </h1>
            <p className="text-sm text-gray-500">Alterando dados de @{user?.username}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose size={24} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Nome Completo
              </label>
              <input
                {...register("nome", { required: "Campo obrigatório" })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Nome do usuário"
              />
              {errors.nome && (
                <span className="text-xs text-red-500 mt-1 block">{errors.nome.message}</span>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                E-mail
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="usuario@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Departamento
              </label>
              <input
                {...register("departamento")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Ex: TI, RH"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Cargo
              </label>
              <input
                {...register("cargo")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Ex: Analista"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Setor / Permissão
              </label>
              <select
                {...register("setor", { required: "Campo obrigatório" })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="GESTAO">GESTAO</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="ativo"
                {...register("ativo")}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="ativo" className="text-sm font-bold text-gray-700 cursor-pointer">
                Usuário Ativo
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal

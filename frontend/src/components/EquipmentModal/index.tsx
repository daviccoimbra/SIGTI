import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { MdClose } from "react-icons/md"
import api from "../../services/api"
import { useToast } from "../../hooks/useToast"

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface EquipmentFormData {
    nome: string
    marcaModelo: string
    unidade: string
    setor: string
}

const EquipmentModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const { showMessage } = useToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EquipmentFormData>()

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

    const onSubmit = async (data: EquipmentFormData) => {
        try {
            await api.post("/equipments", data)
            showMessage("Equipamento cadastrado com sucesso!", "success")
            reset()
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Erro ao cadastrar equipamento:", error)
            showMessage("Erro ao cadastrar equipamento", "error")
        }
    }

    if (!isOpen) return null

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-xl p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-700">
                        Novo Equipamento
                    </h1>
                    <button onClick={onClose}>
                        <MdClose size={24} className="hover:text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Nome do Equipamento*
                        </label>
                        <input
                            {...register("nome", { required: "Campo obrigatório" })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            placeholder="Ex: Notebook Dell, Impressora HP"
                        />
                        {errors.nome && (
                            <span className="text-xs text-red-500">{errors.nome.message}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Marca/Modelo*
                        </label>
                        <input
                            {...register("marcaModelo", { required: "Campo obrigatório" })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            placeholder="Ex: Latitude 3420, LaserJet Pro"
                        />
                        {errors.marcaModelo && (
                            <span className="text-xs text-red-500">{errors.marcaModelo.message}</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Unidade*
                            </label>
                            <input
                                {...register("unidade", { required: "Campo obrigatório" })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                placeholder="Unidade"
                            />
                            {errors.unidade && (
                                <span className="text-xs text-red-500">{errors.unidade.message}</span>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Setor*
                            </label>
                            <input
                                {...register("setor", { required: "Campo obrigatório" })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                placeholder="Setor"
                            />
                            {errors.setor && (
                                <span className="text-xs text-red-500">{errors.setor.message}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Cadastrando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EquipmentModal

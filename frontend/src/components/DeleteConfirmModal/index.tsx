import React from "react"
import { MdWarning, MdDelete, MdClose } from "react-icons/md"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MdWarning size={24} />
            <h3 className="font-bold text-lg text-white">Confirmar Exclusão</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-4">
            <MdDelete className="text-red-600" size={40} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Excluir Usuário?</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tem certeza que deseja remover permanentemente o usuário <span className="font-bold text-gray-700">"{userName}"</span>?
            Esta ação não pode ser desfeita.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <MdDelete size={20} />
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal

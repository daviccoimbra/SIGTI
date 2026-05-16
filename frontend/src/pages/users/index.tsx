import { useState, useEffect, useCallback } from "react"
import { MdSearch, MdEdit, MdDelete, MdPerson, MdEmail, MdBusiness, MdBadge, MdAdminPanelSettings, MdSecurity } from "react-icons/md"
import { getUsers, deleteUser } from "../../services/users"

import type { UserT } from "../../types"
import EditUserModal from "../../components/EditUserModal"
import DeleteConfirmModal from "../../components/DeleteConfirmModal"
import { useToast } from "../../hooks/useToast"


const Users = () => {
  const [users, setUsers] = useState<UserT[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserT | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string, nome: string } | null>(null)

  const { showMessage } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      // O backend filtra por nome, departamento ou cargo. 
      // Para simplificar no front, passamos o termo de busca para os 3 campos (OR logic no backend se desejado, 
      // mas aqui passaremos apenas nome para demonstração ou podemos adaptar)
      const data = await getUsers({ nome: search })
      setUsers(data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      showMessage("Erro ao carregar lista de usuários", "error")
    } finally {
      setLoading(false)
    }
  }, [search, showMessage])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  const handleEdit = (user: UserT) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string, nome: string) => {
    console.log("Abrindo confirmação de deleção para:", nome)
    setUserToDelete({ id, nome })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      console.log("Confirmado no modal. Chamando deleteUser para ID:", userToDelete.id)
      await deleteUser(userToDelete.id)
      showMessage("Usuário removido com sucesso!", "success")
      fetchUsers()
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error)
      const errorMsg = error.response?.data?.error || "Erro ao deletar usuário"
      showMessage(errorMsg, "error")
    } finally {
      setUserToDelete(null)
    }
  }




  return (
    <div className="flex flex-col bg-gray-50 min-h-full p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 mt-1">
            Pesquise, visualize e edite os usuários cadastrados no sistema.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-700"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Contato / Depto</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Cargo</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Setor</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400 font-medium italic">Carregando usuários...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{user.nome}</p>
                          <p className="text-xs text-gray-400 font-medium">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MdEmail className="text-gray-400" />
                          <span>{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MdBusiness className="text-gray-400" />
                          <span>{user.departamento || 'Sem depto.'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <MdBadge className="text-gray-400" />
                        <span>{user.cargo || 'Não informado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${user.setor === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                        {user.setor === 'ADMIN' ? <MdSecurity size={14} /> : <MdPerson size={14} />}
                        {user.setor}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.ativo ? 'text-green-600' : 'text-red-500'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${user.ativo ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                          title="Editar usuário"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id, user.nome)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                          title="Deletar usuário"
                        >
                          <MdDelete size={20} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">
                    Nenhum usuário encontrado para "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onUpdate={fetchUsers}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.nome || ""}
      />
    </div>
  )
}


export default Users

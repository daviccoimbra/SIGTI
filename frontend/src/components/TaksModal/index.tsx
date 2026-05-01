import { useEffect, useState } from "react"
import { MdClose, MdArchive, MdDelete } from "react-icons/md"
import type { TaskT, CommentT } from "../../types"
import api from "../../services/api"

type Tab = "detalhes" | "comentarios" | "historico"


interface Props {
    isOpen: boolean
    onClose: () => void
    task: TaskT | null
    onUpdate?: () => void
}

const TaskModal = ({ isOpen, onClose, task, onUpdate }: Props) => {
    const CURRENT_USER = "Denix" // depois vem do auth
    const [tab, setTab] = useState<Tab>("detalhes")
    const [comments, setComments] = useState<CommentT[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (task) {
            setComments(task.comments || [])
        }
    }, [task])

    // ESC + scroll lock
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
    }, [isOpen])

    if (!isOpen || !task) return null

    const handleArchive = async () => {
        if (!confirm('Deseja realmente arquivar este chamado?')) return;
        setLoading(true);
        try {
            await api.patch(`/tickets/${task.id}/archive`);
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Erro ao arquivar:', error);
            alert('Erro ao arquivar chamado');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!confirm('Deseja realmente excluir este chamado?')) return;
        setLoading(true);
        try {
            await api.delete(`/tickets/${task.id}`);
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir chamado');
        } finally {
            setLoading(false);
        }
    }

    const addComment = () => {
        if (!newComment.trim()) return

        const newItem: CommentT = {
            id: crypto.randomUUID(),
            user: CURRENT_USER,
            message: newComment,
            date: new Date().toISOString(),
        }

        setComments((prev) => [newItem, ...prev])
        setNewComment("")
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-3xl rounded-xl p-6"
            >
                {/* header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-500">
                            {task.titulo} #{task.protocolo}
                        </h1>
                        <h2 className={`px-2 py-[2px] text-[12px] rounded-3xl text-white font-bold whitespace-nowrap ${task.prioridade === "Alta"
                            ? "bg-[#ff6900]"
                            : task.prioridade === "Media"
                                ? "bg-[#f0b100]"
                                : "bg-[#00c950]"}`}>
                            {task.prioridade}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            disabled={loading}
                            onClick={handleArchive}
                            title="Arquivar"
                            className="text-gray-400 hover:text-blue-600 disabled:opacity-50"
                        >
                            <MdArchive size={22} />
                        </button>
                        <button 
                            disabled={loading}
                            onClick={handleDelete}
                            title="Excluir"
                            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                        >
                            <MdDelete size={22} />
                        </button>
                        <button onClick={onClose} >
                            <MdClose size={22} className="hover:bg-red-400 hover:text-white hover:rounded-lg" />
                        </button>
                    </div>
                </div>

                {/* abas */}
                <div className="flex gap-4 border-b mb-4">
                    {["detalhes", "comentarios", "historico"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t as Tab)}
                            className={`pb-2 capitalize
                ${tab === t
                                    ? "border-b-2 border-blue-600 font-bold"
                                    : "text-gray-500"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* conteúdo */}
                {tab === "detalhes" && (
                    <div>
                        <p><b>Solicitante:</b> {task.solicitante}</p>
                        <p><b>Departamento:</b> {task.departamento}</p>
                        <p className="mt-3">{task.descricao}</p>
                    </div>
                )}

                {tab === "comentarios" && (
                    <div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="Escreva um comentário..."
                        />

                        <button
                            onClick={addComment}
                            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                        >
                            Comentar
                        </button>

                        <div className="mt-4 space-y-2">
                            {comments.map((c) => (
                                <div key={c.id} className="p-3 border rounded bg-gray-50">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span className="font-bold text-gray-600">{c.user}</span>
                                        <span>{new Date(c.date).toLocaleString()}</span>
                                    </div>

                                    <p className="text-sm text-gray-700">
                                        {c.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "historico" && (
                    <div className="space-y-3 max-h-[300px] overflow-auto">
                        {!task.history || task.history.length === 0 ? (
                            <div className="text-gray-500">
                                Nenhum histórico ainda...
                            </div>
                        ) : (
                            task.history
                                .slice()
                                .reverse()
                                .map((h, i) => (
                                    <div
                                        key={i}
                                        className="p-3 border rounded bg-gray-50 text-sm"
                                    >
                                        <p className="text-gray-700">
                                            <span className="font-bold">{h.user}</span>{" "}
                                            moveu de{" "}
                                            <span className="font-bold">{h.from}</span>{" "}
                                            para{" "}
                                            <span className="font-bold">{h.to}</span>
                                        </p>

                                        <span className="text-gray-400 text-xs">
                                            {new Date(h.date).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>
                )}
            </div>
        </div >
    )
}

export default TaskModal
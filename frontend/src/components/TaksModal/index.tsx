import { useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
    MdArchive,
    MdClose,
    MdDelete,
    MdUnarchive,
    MdAttachFile,
    MdFileDownload,
} from "react-icons/md"

import type { CommentT, TaskT } from "../../types"

import { useToast } from "../../hooks/useToast"
import { useAuth } from "../../hooks/useAuth"
import { useTicketMutations } from "../../hooks/useTicketMutations"

type Tab =
    | "detalhes"
    | "comentarios"
    | "historico"
    | "anexos"

interface Props {
    isOpen: boolean
    onClose: () => void
    task: TaskT | null
}

const TaskModal = ({
    isOpen,
    onClose,
    task,
}: Props) => {
    const { user } = useAuth()
    const CURRENT_USER = user?.username || "Desconhecido"

    const { showMessage } = useToast()

    const {
        addComment,
        archiveTicket,
        deleteTicket,
    } = useTicketMutations()

    const [tab, setTab] =
        useState<Tab>("detalhes")

    const [newComment, setNewComment] =
        useState("")

    // ESC + scroll lock
    useEffect(() => {
        const handleEsc = (
            e: KeyboardEvent
        ) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.body.style.overflow =
                "hidden"

            document.addEventListener(
                "keydown",
                handleEsc
            )
        }

        return () => {
            document.body.style.overflow =
                "auto"

            document.removeEventListener(
                "keydown",
                handleEsc
            )
        }
    }, [isOpen, onClose])

    const priorityClass = useMemo(() => {
        switch (task?.prioridade) {
            case "Crítica":
                return "bg-[#dc2626]"

            case "Alta":
                return "bg-[#ff6900]"

            case "Média":
                return "bg-[#f0b100]"

            case "Media":
                return "bg-[#f0b100]"

            default:
                return "bg-[#00c950]"
        }
    }, [task?.prioridade])

    if (!isOpen || !task) return null

    const handleArchive = async () => {
        const confirmMessage =
            task.isArchived
                ? "Deseja realmente desarquivar este chamado?"
                : "Deseja realmente arquivar este chamado?"

        if (!confirm(confirmMessage)) {
            return
        }

        try {
            const historyItem = {
                from: task.isArchived
                    ? "Arquivados"
                    : "Desarquivados",

                to: task.isArchived
                    ? "Desaquivados"
                    : "Arquivados",

                user: CURRENT_USER,

                date: new Date().toISOString(),
            }

            await archiveTicket.mutateAsync({
                id: task.id,
                history: historyItem,
            })
            showMessage("Chamado arquivado com sucesso!", "success")
            onClose()
        } catch (error) {
            console.error(error)

            showMessage(
                "Erro ao arquivar chamado",
                "error"
            )
        }
    }

    const handleDelete = async () => {
        if (
            !confirm(
                "Deseja realmente excluir este chamado?"
            )
        ) {
            return
        }

        try {
            await deleteTicket.mutateAsync(
                task.id
            )
            showMessage("Ticket deletado com sucesso!", "success")
            onClose()
        } catch (error) {
            console.error(error)

            showMessage(
                "Erro ao excluir chamado",
                "error"
            )
        }
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) return

        try {
            const comment: CommentT = {
                id: uuidv4(),

                user: CURRENT_USER,

                message: newComment,

                date: new Date().toISOString(),
            }

            await addComment.mutateAsync({
                ticketId: task.id,
                comment,
            })
            showMessage("Comentário adicionado com sucesso!", "success")
            setNewComment("")
        } catch (error) {
            console.error(error)

            showMessage(
                "Erro ao adicionar comentário",
                "error"
            )
        }
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        >
            <div
                onClick={(e) =>
                    e.stopPropagation()
                }
                className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg"
            >
                {/* HEADER */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-700">
                            {task.titulo} #
                            {task.protocolo}
                        </h1>

                        <span
                            className={`rounded-full px-2 py-[2px] text-xs font-bold text-white ${priorityClass}`}
                        >
                            {task.prioridade}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={
                                archiveTicket.isPending
                            }
                            onClick={
                                handleArchive
                            }
                            title={
                                task.isArchived
                                    ? "Desarquivar"
                                    : "Arquivar"
                            }
                            className="text-gray-400 transition hover:text-blue-600 disabled:opacity-50"
                        >
                            {task.isArchived ? (
                                <MdUnarchive
                                    size={22}
                                />
                            ) : (
                                <MdArchive
                                    size={22}
                                />
                            )}
                        </button>

                        <button
                            disabled={
                                deleteTicket.isPending
                            }
                            onClick={
                                handleDelete
                            }
                            title="Excluir"
                            className="text-gray-400 transition hover:text-red-600 disabled:opacity-50"
                        >
                            <MdDelete size={22} />
                        </button>

                        <button
                            onClick={onClose}
                        >
                            <MdClose
                                size={22}
                                className="rounded-lg transition hover:bg-red-400 hover:text-white"
                            />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="mb-4 flex gap-4 border-b">
                    {([
                        "detalhes",
                        "comentarios",
                        "historico",
                        ...(task.anexo ? ["anexos"] : []),
                    ] as Tab[]).map((item) => (
                        <button
                            key={item}
                            onClick={() =>
                                setTab(item)
                            }
                            className={`pb-2 capitalize transition
                            ${tab === item
                                    ? "border-b-2 border-blue-600 font-bold"
                                    : "text-gray-500"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* DETALHES */}
                {tab === "detalhes" && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <p>
                                <b>Solicitante:</b> {task.solicitante}
                            </p>
                            <p>
                                <b>Departamento:</b> {task.departamento}
                            </p>
                            <p>
                                <b>Categoria:</b> {task.category?.descricao || "Não informada"}
                            </p>
                            <p>
                                <b>Classificação:</b> {task.classificacao || "Não informada"}
                            </p>
                        </div>

                        <p>
                            <b>Equipamento:</b> {task.equipment 
                                ? `${task.equipment.nome} (${task.equipment.marcaModelo})`
                                : "Nenhum equipamento vinculado"
                            }
                        </p>

                        <div className="mt-4 border-t pt-4">
                            <h3 className="mb-2 font-bold text-gray-700">Descrição do Problema:</h3>
                            <p className="text-gray-700">{task.descricao}</p>
                        </div>
                    </div>
                )}

                {/* COMENTÁRIOS */}
                {tab === "comentarios" && (
                    <div>
                        {!task.isArchived && (
                            <>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escreva um comentário..."
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />

                                <button
                                    type="button"
                                    disabled={addComment.isPending}
                                    onClick={handleAddComment}
                                    className="mt-2 rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {addComment.isPending ? "Comentando..." : "Comentar"}
                                </button>
                            </>
                        )}

                        <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-2">
                            {!task.comments || task.comments.length === 0 ? (
                                <div className="text-sm text-gray-500">Nenhum comentário ainda...</div>
                            ) : (
                                task.comments
                                    .slice()
                                    .reverse()
                                    .map((comment) => (
                                        <div key={comment.id} className="rounded border bg-gray-50 p-3">
                                            <div className="mb-1 flex justify-between text-xs text-gray-400">
                                                <span className="font-bold text-gray-600">{comment.user}</span>
                                                <span>{new Date(comment.date).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.message}</p>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {/* HISTÓRICO */}
                {tab === "historico" && (
                    <div className="max-h-[300px] space-y-3 overflow-auto">
                        {!task.history || task.history.length === 0 ? (
                            <div className="text-gray-500">Nenhum histórico ainda...</div>
                        ) : (
                            task.history
                                .slice()
                                .reverse()
                                .map((history, index) => (
                                    <div key={index} className="rounded border bg-gray-50 p-3 text-sm">
                                        <p className="text-gray-700">
                                            <span className="font-bold">{history.user}</span> moveu de{" "}
                                            <span className="font-bold">{history.from}</span> para{" "}
                                            <span className="font-bold">{history.to}</span>
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            {new Date(history.date).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>
                )}
                
                {/* ANEXOS */}
                {tab === "anexos" && task.anexo && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <MdAttachFile size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">Arquivo Anexado</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-md">{task.anexo}</p>
                                </div>
                            </div>
                            <a 
                                href={`http://localhost:3001/archive/${task.anexo}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <MdFileDownload size={18} />
                                Download
                            </a>
                        </div>
                        
                        {(task.anexo.toLowerCase().endsWith('.png') || 
                          task.anexo.toLowerCase().endsWith('.jpg') || 
                          task.anexo.toLowerCase().endsWith('.jpeg') || 
                          task.anexo.toLowerCase().endsWith('.webp')) && (
                            <div className="mt-4 border rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                                <img 
                                    src={`http://localhost:3001/archive/${task.anexo}`} 
                                    alt="Anexo do chamado" 
                                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                />
                            </div>
                        )}
                        
                        {task.anexo.toLowerCase().endsWith('.pdf') && (
                            <div className="mt-4 border rounded-2xl overflow-hidden h-[400px] shadow-sm">
                                <iframe 
                                    src={`http://localhost:3001/archive/${task.anexo}`} 
                                    title="PDF Viewer"
                                    className="w-full h-full border-none"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskModal
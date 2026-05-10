import { useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
    MdArchive,
    MdClose,
    MdDelete,
    MdUnarchive,
} from "react-icons/md"

import type { CommentT, TaskT } from "../../types"

import { useToast } from "../../context/toastContext"
import { useTicketMutations } from "../../hooks/useTicketMutations"

type Tab =
    | "detalhes"
    | "comentarios"
    | "historico"

interface Props {
    isOpen: boolean
    onClose: () => void
    task: TaskT | null
}

const tabs: Tab[] = [
    "detalhes",
    "comentarios",
    "historico",
]

const TaskModal = ({
    isOpen,
    onClose,
    task,
}: Props) => {
    const CURRENT_USER = "Denix"

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
            case "Alta":
                return "bg-[#ff6900]"

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
                    {tabs.map((item) => (
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
                        <p>
                            <b>
                                Solicitante:
                            </b>{" "}
                            {
                                task.solicitante
                            }
                        </p>

                        <p>
                            <b>
                                Departamento:
                            </b>{" "}
                            {
                                task.departamento
                            }
                        </p>

                        <p className="pt-2 text-gray-700">
                            {
                                task.descricao
                            }
                        </p>
                    </div>
                )}

                {/* COMENTÁRIOS */}
                {tab === "comentarios" && (
                    <div>
                        {!task.isArchived && (
                            <>
                                <textarea
                                    value={
                                        newComment
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setNewComment(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Escreva um comentário..."
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />

                                <button
                                    type="button"
                                    disabled={
                                        addComment.isPending
                                    }
                                    onClick={
                                        handleAddComment
                                    }
                                    className="mt-2 rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {addComment.isPending
                                        ? "Comentando..."
                                        : "Comentar"}
                                </button>
                            </>
                        )}

                        <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-2">
                            {!task.comments ||
                                task.comments
                                    .length ===
                                0 ? (
                                <div className="text-sm text-gray-500">
                                    Nenhum comentário
                                    ainda...
                                </div>
                            ) : (
                                task.comments
                                    .slice()
                                    .reverse()
                                    .map(
                                        (
                                            comment
                                        ) => (
                                            <div
                                                key={
                                                    comment.id
                                                }
                                                className="rounded border bg-gray-50 p-3"
                                            >
                                                <div className="mb-1 flex justify-between text-xs text-gray-400">
                                                    <span className="font-bold text-gray-600">
                                                        {
                                                            comment.user
                                                        }
                                                    </span>

                                                    <span>
                                                        {new Date(
                                                            comment.date
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-700">
                                                    {
                                                        comment.message
                                                    }
                                                </p>
                                            </div>
                                        )
                                    )
                            )}
                        </div>
                    </div>
                )}

                {/* HISTÓRICO */}
                {tab === "historico" && (
                    <div className="max-h-[300px] space-y-3 overflow-auto">
                        {!task.history ||
                            task.history
                                .length === 0 ? (
                            <div className="text-gray-500">
                                Nenhum histórico
                                ainda...
                            </div>
                        ) : (
                            task.history
                                .slice()
                                .reverse()
                                .map(
                                    (
                                        history,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="rounded border bg-gray-50 p-3 text-sm"
                                        >
                                            <p className="text-gray-700">
                                                <span className="font-bold">
                                                    {
                                                        history.user
                                                    }
                                                </span>{" "}
                                                moveu
                                                de{" "}
                                                <span className="font-bold">
                                                    {
                                                        history.from
                                                    }
                                                </span>{" "}
                                                para{" "}
                                                <span className="font-bold">
                                                    {
                                                        history.to
                                                    }
                                                </span>
                                            </p>

                                            <span className="text-xs text-gray-400">
                                                {new Date(
                                                    history.date
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    )
                                )
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskModal
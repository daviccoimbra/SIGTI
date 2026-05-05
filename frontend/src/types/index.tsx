export type CommentT = {
  id: string
  user: string
  message: string
  date: string
}

export type HistoryItem = {
  from: string
  to: string
  user: string
  date: string
}

// type ticket
export type TaskT = { 
  id: string
  createdAt: string
  protocolo: string
  solicitante: string
  departamento: string
  titulo: string
  descricao: string
  prioridade: string
  status: string
  isArchived: boolean
  comments?: CommentT[]
  history?: HistoryItem[]
}

type Column = {
    name: string;
    items: TaskT[];
}

export type Columns = {
    [key: string]: Column
}
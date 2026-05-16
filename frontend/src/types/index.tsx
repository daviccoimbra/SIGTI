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
  requesterId?: string
  requester?: RequesterT
  departamento: string
  categoryId?: string
  category?: CategoryT
  equipmentId?: string
  equipment?: EquipmentT
  titulo: string
  descricao: string
  classificacao?: string
  prioridade: string
  status: string
  isArchived: boolean
  anexo?: string
  comments?: CommentT[]
  history?: HistoryItem[]
}

export type RequesterT = {
  id: string
  nome: string
  cargo: string
  unidade: string
  setor: string
  createdAt: string
}

export type CategoryT = {
  id: string
  descricao: string
  createdAt: string
}

export type EquipmentT = {
  id: string
  nome: string
  marcaModelo: string
  unidade: string
  setor: string
  createdAt: string
}

type Column = {
    name: string;
    items: TaskT[];
}

export type Columns = {
    [key: string]: Column
}
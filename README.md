#  SIGTI - Sistema de Gestão de Chamados de TI

Sistema desenvolvido para gerenciamento de chamados internos do setor de TI do Laboratório Martins Pinto.

---

##  Objetivo

Centralizar, organizar e acompanhar as demandas de TI, substituindo processos informais (como WhatsApp), permitindo:

- Abertura de chamados
- Acompanhamento de status
- Histórico de atendimentos
- Organização e priorização de demandas

---

##  Estrutura do Projeto
sigti/
├── backend/ # API Node.js + Prisma + PostgreSQL
├── frontend/ # Aplicação React
├── docker-compose.yaml


---

##  Tecnologias Utilizadas

### Frontend
- React
- TypeScript

### Backend
- Node.js
- TypeScript
- Prisma ORM

### Banco de Dados
- PostgreSQL (via Docker)

### DevOps
- Docker
- Docker Compose

---

##  Como rodar o projeto

### 🔹 1. Clonar o repositório
- bash:

git clone -b dev https://github.com/DenixVieira/PI.git

### 2. Subir o banco, Front e Back com Docker

docker compose up -d
- Verificar se está rodando:

docker ps

### Portas utilizadas
| Serviço  | Porta |
| -------- | ----- |
| Frontend | 5173  |
| Backend  | 3000  |
| Postgres | 5432  |














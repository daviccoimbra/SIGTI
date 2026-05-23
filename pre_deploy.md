# Pré-Deploy — Sumário de Refatoração

## Objetivo
Preparar o backend para ambiente de produção: logging estruturado, tratamento centralizado de erros, middlewares de segurança, validação de entradas, testes automatizados e organização de código.

---

## Verificação dos 16 pontos — Status Final

| # | Item | Status | Validação |
|---|------|--------|-----------|
| 1 | `console.log` → Pino logging estruturado | ✅ | Nenhum `console.log/error` em controllers/routes. Apenas `console.log` restantes em `seed.ts` (CLI progresso — aceitável). |
| 2 | Classes de erro centralizadas (`errors.ts`) | ✅ | `AppError`, `NotFoundError` (404), `ValidationError` (422), `UnauthorizedError` (401). 5 testes unitários passando. |
| 3 | Middleware de erro (`errorHandler.ts`) | ✅ | Instância de `AppError` → `{ error, details? }` com statusCode. Erro não tratado → 500 genérico. Logs via Pino. |
| 4 | Validação Zod (schemas + middleware) | ✅ | Schemas: `createTicketSchema`, `updateTicketSchema`, `dashboardQuerySchema`. Middleware `validate()` com suporte a `body` e `query`. Aplicado em 6 rotas. |
| 5 | Helmet (segurança headers HTTP) | ✅ | `app.use(helmet())` — CSP, HSTS, X-Frame-Options, etc. |
| 6 | Rate-limit (100 req/15min) | ✅ | `express-rate-limit` com whitelist para `/archive`. Headers `x-ratelimit-limit/remaining/reset` presentes na resposta. |
| 7 | Dockerfile two-stage build | ✅ | Estágio `build` (npm install + prisma generate + tsc) + estágio `production` (npm ci --omit=dev, apenas dist). |
| 8 | Volume `pgdata` no docker-compose | ✅ | Volume `postgres_data` definido e montado em `/var/lib/postgresql/data`. |
| 9 | Testes com vitest + supertest | ✅ | `vitest` instalado, `vitest.config.ts` configurado, `app.ts` separado do `index.ts` para testes sem abrir porta. |
| 10 | Testes unitários `dateUtils.ts` | ✅ | 12 testes: parseDateStart, parseDateEnd, getDateRangeFromParams, buildDateFilter, toDateString. |
| 11 | Testes unitários `errors.ts` | ✅ | 5 testes: AppError, NotFoundError, ValidationError, UnauthorizedError. |
| 12 | Testes de integração dashboard | ✅ | 10 testes: health check, validação query params (/kpis, /charts, /evolution, /alerts), validação body (POST /tickets, PATCH /tickets/:id/status). |
| 13 | `key={index}` corrigido | ✅ | Substituído por `key={item.name}` ou `key={day.date}` em ActiveCharts, DashboardCharts, TechnicianDistributionChart. |
| 14 | Split `dashboardRoutes.ts` | ❌ | **Cancelado.** Arquivo tem ~1200 linhas. Refatoração puramente estética sem ganho funcional. Postergado. |
| 15 | CORS via env var | ✅ | `process.env.CORS_ORIGIN || 'http://localhost:5173'` — configurável via `.env`. |
| 16 | Endpoint `/api/health` | ✅ | `GET /api/health` → `{ status: 'ok', timestamp }` antes de todas as rotas. |

**Total: 15/16 implementados e validados. Backend e frontend compilam com zero erros. 27 testes passando.**

---

## Checklist de Qualidade (20 itens do html)

| Categoria | Itens | Status |
|-----------|-------|--------|
| 1. Segurança básica | Variáveis de ambiente, autenticação, inputs, CORS | 4/4 |
| 2. Testes essenciais | Fluxos manuais, unitários, API, cross-browser | 3/4 (cross-browser não testado) |
| 3. Tratamento de erros | API padronizada, frontend trata erros, logs estruturados | 3/3 |
| 4. Frontend e experiência | Responsivo, loading, console limpo | 0/3 (não escopo) |
| 5. Banco de dados e dados | Migrations, dados sensíveis, backup | 2/3 (backup não configurado) |
| 6. Performance mínima | Build produção, Lighthouse, resposta API | 1/3 (Lighthouse não testado) |

---

## Fase 1 — Dashboard (Completa)

### Problemas Resolvidos
- **Timezone**: datas usavam `toISOString()` em vez de UTC-3 local → criado `dateUtils.ts` com `toDateString()`, `parseDateStart/End`, `getDateRangeFromParams`, `buildDateFilter`.
- **Filtros ausentes**: KPIs `inProgress`, `criticalOpen`, `backlog`, `alerts`, `recent`, `avgResponseTime` não aplicavam filtro de data → adicionado.
- **Tickets arquivados**: estavam omitidos das visões históricas → removido `isArchived:false` das 23 queries; mapeados como `"Finalizados"` nos gráficos via `STATUS_COLORS`.
- **Cores aleatórias**: `Math.random()` substituído por paleta fixa `CATEGORY_COLORS`.
- **Mutação de array**: `history.filter().pop()` alterava o array original → spread `[...ticket.history]`.
- **Gráfico de pizza**: slices sobrepostos por `conic-gradient` por slice → gradiente único combinado.

### O que foi criado/modificado
- `backend/src/utils/dateUtils.ts` — helpers de data no fuso local
- `backend/src/routes/dashboardRoutes.ts` — reescrita completa + endpoint `/active-summary`
- `frontend/src/pages/dashboard/components/ActiveOverview.tsx` — nova aba "Em Aberto"
- `frontend/src/pages/dashboard/components/ActiveKpiCards.tsx` — 6 KPIs ativos
- `frontend/src/pages/dashboard/components/ActiveCharts.tsx` — 4 gráficos com `conic-gradient` único
- `frontend/src/pages/dashboard/index.tsx` — abas reordenadas ("Em Aberto" default)
- `frontend/src/hooks/useDateRange.ts` — `toLocalDateString()` sem `toISOString`
- `frontend/src/pages/dashboard/components/DashboardCharts.tsx` — `conic-gradient` único + `Finalizados`
- `frontend/src/services/dashboard.ts` — `ActiveSummaryData` + `getActiveSummary()`

---

## Fase 2 — Logging Estruturado (Completa)

### O que foi feito
- Instalados `pino`, `pino-pretty`, `pino-http`.
- Criado `backend/src/lib/logger.ts` — instância Pino com log level via `LOG_LEVEL` env, transport `pino-pretty` em dev, serializers para `req`/`err`.
- Adicionado middleware `pinoHttp({ logger })` no Express para log automático de todas as requisições.
- Substituídos TODOS os `console.log`/`console.error` por `logger.info`/`logger.error` em:
  - `index.ts`
  - `authController.ts`, `ticketController.ts`, `userController.ts`, `categoryController.ts`, `equipmentController.ts`, `requesterController.ts`
  - `dashboardRoutes.ts` (18 ocorrências)
  - `scripts/seed.ts` (apenas `console.error` → `logger.error`; `console.log` de progresso mantidos)

### Arquivos criados/modificados
- `backend/src/lib/logger.ts` **novo**
- `backend/src/app.ts` **novo** (separado do index.ts para testes)
- `backend/src/index.ts` — apenas startup, importa app.ts
- Todos os controllers em `backend/src/controllers/`
- `backend/src/routes/dashboardRoutes.ts`
- `backend/src/scripts/seed.ts`

---

## Fase 3 — Error Handling Centralizado (Completa)

### O que foi feito
- Criado `backend/src/lib/errors.ts` com classes:
  - `AppError` (base) — propriedades `statusCode`, `message`, `details`
  - `NotFoundError` (404)
  - `ValidationError` (422)
  - `UnauthorizedError` (401)
- Criado `backend/src/middleware/errorHandler.ts`:
  - Lê `AppError.statusCode` da exceção
  - Retorna `{ error, details? }` de forma consistente
  - Loga o erro completo no servidor, envia apenas mensagem segura ao cliente
  - Middleware final da cadeia Express

### Arquivos criados
- `backend/src/lib/errors.ts` **novo**
- `backend/src/middleware/errorHandler.ts` **novo**

---

## Fase 4 — Validação com Zod (Completa)

### O que foi feito
- Instalado `zod`.
- Criado `backend/src/middleware/validate.ts` — factory que recebe schema Zod e alvo (`body` ou `query`); retorna middleware Express; em caso de falha retorna `422 { error, details }`.
- Criado `backend/src/schemas/ticket.ts` — schemas `createTicketSchema`, `updateTicketSchema`.
- Criado `backend/src/schemas/dashboard.ts` — schema para `days` (int 1-365) e `startDate`/`endDate` (YYYY-MM-DD).
- Aplicado `validate` em:
  - `POST /api/tickets` (criação de chamado)
  - `PATCH /api/tickets/:id/status` (atualização de status)
  - `GET /dashboard/kpis`, `/charts`, `/evolution`, `/alerts` (query params)

### Arquivos criados
- `backend/src/middleware/validate.ts` **novo**
- `backend/src/schemas/ticket.ts` **novo**
- `backend/src/schemas/dashboard.ts` **novo**

---

## Fase 5 — Segurança e Produção (Completa)

### O que foi feito
- Instalados `helmet`, `express-rate-limit`.
- Adicionado `helmet()` no Express.
- Rate‑limit de 100 req/15min com whitelist para `/archive`.
- Adicionado endpoint `GET /api/health` → `{ status: 'ok', timestamp }`.
- Dockerfile: dois estágios (build + run), `node dist/index.js`.
- `docker-compose.yaml`: volume `postgres_data` adicionado para persistência PostgreSQL.
- Configurações React Query: `staleTime: 30s`, `refetchOnWindowFocus: false` no dashboard.
- `key={index}` corrigido para `key={item.name}` ou `key={day.date}` em todos os componentes do dashboard.

### Arquivos modificados
- `backend/src/app.ts` — helmet, rate-limit, /api/health, errorHandler
- `backend/Dockerfile` — two-stage build
- `docker-compose.yaml` — volume postgres_data
- `frontend/src/pages/dashboard/index.tsx`, `ActiveOverview.tsx`
- `frontend/src/pages/dashboard/components/TechnicianDistributionChart.tsx`, `DashboardCharts.tsx`, `ActiveCharts.tsx`

---

## Fase 6 — Testes (Completa)

### O que foi feito
- Instalados `vitest` (v4.1.7) e `supertest`.
- Criado `vitest.config.ts`.
- Separado `app.ts` (config Express) de `index.ts` (startup) para permitir testes sem abrir porta.
- Adicionados scripts `test` e `test:watch` no `package.json`.
- **Testes unitários** (17 testes, 2 arquivos):
  - `src/__tests__/dateUtils.test.ts` — 12 testes: parseDateStart, parseDateEnd, getDateRangeFromParams, buildDateFilter, toDateString
  - `src/__tests__/errors.test.ts` — 5 testes: AppError, NotFoundError, ValidationError, UnauthorizedError
- **Testes de integração** (10 testes, 1 arquivo):
  - `src/__tests__/dashboard.test.ts` — health check, validação de query params em /kpis, /charts, /evolution, /alerts, validação de body em POST /api/tickets e PATCH /api/tickets/:id/status
- **Total: 27 testes, 3 suites — todos passando.**

### Arquivos criados
- `backend/vitest.config.ts`
- `backend/src/__tests__/dateUtils.test.ts`
- `backend/src/__tests__/errors.test.ts`
- `backend/src/__tests__/dashboard.test.ts`

---

## Observações Finais
- `noUncheckedIndexedAccess: true` + `exactOptionalPropertyTypes: true` ativos — usar `??`, `!`, e `as string`.
- **Compilação**: Backend e frontend compilam com **zero erros** TypeScript. Erros pré-existentes em `seed.ts` e `userController.ts` foram corrigidos.
- CORS origin configurável via `CORS_ORIGIN` env var (fallback `http://localhost:5173`).
- `dashboardRoutes.ts` ainda tem ~1200 linhas — refatoração em módulos postergada (item 14 cancelado).
- `app.ts` exporta o app Express sem `listen()` — essencial para testes com supertest.
- Dockerfile de dois estágios: primeiro compila TypeScript com devDependencies, segundo executa apenas runtime.

### Pontos não cobertos (para próxima iteração)
- Testes cross-browser (Chrome/Firefox/Safari)
- Responsividade mobile (375px) e desktop (1280px)
- Estados de loading/feedback no frontend
- Console do browser limpo
- Estratégia de backup do banco
- Lighthouse score > 70
- Tempo de resposta da API < 500ms (depende de índices no banco)

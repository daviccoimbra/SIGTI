# Plano de Deploy e Análise de Produção (Production-Ready)

Este documento apresenta uma análise detalhada da prontidão para produção (Production-Readiness) da aplicação **SIGTI** e um plano de deploy passo a passo utilizando **Vercel** (para o Frontend), **Koyeb** (para o Backend) e **Supabase** (para o Banco de Dados PostgreSQL).

---

## 🔍 1. Análise de Prontidão para Produção (Production-Ready)

Uma análise rigorosa do estado atual do código e das configurações de ambiente revelou pontos críticos a serem ajustados antes de realizar o deploy. Abaixo estão as análises e as melhorias que já foram aplicadas.

### A. Variáveis de Ambiente e Arquivo `.env`
O arquivo `.env` atual contém dados locais que **nunca** devem ir para produção:
- `DATABASE_URL`: Aponta para um container Docker local (`@postgres:5432`). Em produção, deverá apontar para o pooler ou conexão direta do Supabase.
- `JWT_SECRET`: Está definido como `"minha_chave_super_secreta"`. Em produção, deve ser um hash de alta entropia gerado aleatoriamente (ex: `openssl rand -hex 32`).
- `PORT`: Está fixado em `3001`. Plataformas PaaS como o Koyeb injetam dinamicamente a porta na variável `PORT`. O backend foi verificado e já está tratando corretamente com `process.env.PORT || 3001` no arquivo `index.ts`.
- `CORS_ORIGIN`: Precisa ser restrito ao domínio oficial do frontend na Vercel (ex: `https://sigti.vercel.app`) em vez do padrão de desenvolvimento, para evitar vulnerabilidades de Cross-Origin.
- `VITE_API_URL`: O frontend precisa saber onde enviar requisições de API em produção. 

> [!IMPORTANT]
> **Melhoria Aplicada**: Criamos o arquivo [`.env.example`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/.env.example) na raiz do projeto para servir como referência limpa de todas as variáveis exigidas, com explicações sobre qual tipo de dado preencher em cada ambiente.

---

### B. Correção das Falhas de Compilação TypeScript (Frontend)
Ao rodar testes de compilação estritos no frontend com `npx tsc --noEmit`, identificamos **9 erros de compilação TypeScript** que fariam com que a Vercel e o Koyeb rejeitassem o build e falhassem no deploy:
1. `src/components/TaksModal/index.tsx:554:45`: Erro de tipo onde um valor potencialmente `undefined` (`task.anexo`) estava sendo passado para a função `downloadAttachment` que exige uma `string`.
2. Outros **8 erros** relacionados a imports declarados mas nunca usados (ex: `Skeleton` em diversos gráficos do Dashboard) e parâmetros de map sem uso (`idx` em `CategoryByUnitChart.tsx`), sob a regra estrita de TypeScript `"noUnusedLocals": true` e `"noUnusedParameters": true`.

> [!TIP]
> **Melhorias Aplicadas**:
> - Adicionamos o operador de asserção não-nula `!` em `task.anexo!` no arquivo [`TaksModal/index.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/components/TaksModal/index.tsx#L554) (uma vez que o bloco já é verificado e garantido pela condicional de renderização).
> - Removemos todos os imports de `Skeleton` e variáveis não utilizadas nos componentes [`ActiveTicketAgeCard.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/pages/dashboard/components/ActiveTicketAgeCard.tsx), [`AvgTimeByStatusChart.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/pages/dashboard/components/AvgTimeByStatusChart.tsx), [`CategoryByUnitChart.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/pages/dashboard/components/CategoryByUnitChart.tsx), [`CategoryTrendChart.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/pages/dashboard/components/CategoryTrendChart.tsx), [`EquipmentIssuesChart.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/pages/dashboard/components/EquipmentIssuesChart.tsx) e [`ResolutionByCategoryChart.tsx`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/pages/dashboard/components/ResolutionByCategoryChart.tsx).
> - **Status Atual**: A compilação TypeScript do Frontend e do Backend agora completam com **sucesso absoluto (ZERO erros)**.

---

### C. Integração da API e CORS no Frontend (Vite)
No desenvolvimento local, o frontend se comunica usando a rota relativa `/api`, confiando no proxy do servidor de desenvolvimento Vite (`vite.config.ts`).
Em ambiente de produção na Vercel, o Vite não roda em tempo de execução; a Vercel serve apenas arquivos estáticos (HTML/CSS/JS). Portanto, a rota relativa `/api` causará erros 404 imediatos se o navegador tentar disparar requisições para o próprio domínio da Vercel.

> [!TIP]
> **Melhorias Aplicadas**:
> 1. Atualizamos o arquivo [`api.ts`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/src/services/api.ts) do frontend para obter dinamicamente a URL base:
>    ```typescript
>    baseURL: (import.meta.env.VITE_API_URL as string | undefined) || '/api',
>    ```
>    Isso permite que você defina a variável `VITE_API_URL` na Vercel apontando para o seu backend no Koyeb.
> 2. Criamos o arquivo [`vercel.json`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/frontend/vercel.json) na raiz do frontend com redirecionamento Single Page Application (SPA):
>    ```json
>    {
>      "cleanUrls": true,
>      "trailingSlash": false,
>      "rewrites": [
>        { "source": "/((?!assets|favicon.ico|vite.svg).*)", "destination": "/index.html" }
>      ]
>    }
>    ```
>    Isso garante que ao atualizar páginas como `/chamados` ou `/dashboard` diretamente no navegador, o usuário não receba um erro 404 da Vercel.

---

### D. Tratamento de Erros e Logs Estruturados
Para a produção, logs do console (`console.log`, `console.error`) são ineficientes e degradam a performance. O backend já possui suporte estruturado do `Pino`.

> [!IMPORTANT]
> **Melhoria Aplicada**: Identificamos e corrigimos o último `console.error` remanescente nas rotas de produção, localizado no tratamento do arquivo de anexo em [`app.ts`](file:///home/davi/Documentos/IFAL/PINT/teste-producao/PI/backend/src/app.ts#L76), substituindo-o pelo logger estruturado `logger.error({ err }, 'Erro ao obter arquivo do arquivo')`.

---

## 🛠️ 2. Arquitetura de Produção Proposta

A imagem abaixo ilustra o fluxo de dados e comunicação da nossa infraestrutura em produção:

```mermaid
graph TD
    Client[Navegador do Cliente]
    Vercel[Frontend - Vercel<br>sigti.vercel.app]
    Koyeb[Backend - Koyeb Server<br>sigti-backend.koyeb.app]
    Supabase[Database - Supabase<br>PostgreSQL AWS]

    Client -->|1. Carrega HTML/JS/CSS| Vercel
    Client -->|2. Requisições REST HTTPS /api| Koyeb
    Koyeb -->|3. Consulta SQL Porta 5432| Supabase
```

---

## 🚀 3. Plano de Deploy Passo a Passo

### 📦 FASE 1: Banco de Dados no Supabase

O Supabase hospedará a nossa base de dados PostgreSQL. Ele fornece alta disponibilidade e backup automáticos.

1. **Criar o Projeto**:
   - Acesse o [Supabase](https://supabase.com) e crie uma conta gratuita.
   - Crie um novo projeto, dê um nome (ex: `sigti`) e defina uma senha forte para o banco de dados.
   - Escolha a região mais próxima dos seus servidores do Koyeb (recomendado: **AWS South America (São Paulo) - sa-east-1** ou **AWS East US (N. Virginia)**).
2. **Obter a Connection String**:
   - Vá em **Project Settings** > **Database**.
   - Procure por **Connection string** e selecione a aba **URI**.
   - Escolha o modo **Direct** (Porta `5432`). A URL de transações (Porta `6543`) com Pgbouncer só é recomendada se estivéssemos usando Serverless Functions (Vercel Backend). Como utilizaremos o Koyeb (servidor persistente), a conexão direta é mais performática e evita problemas de Prepared Statements com o Prisma.
   - Sua URL será parecida com:
     `postgresql://postgres.[SEU-ID]:[SUA-SENHA]@aws-0-[REGIAO].pooler.supabase.com:5432/postgres`
3. **Aplicar as Migrações do Banco**:
   - Em sua máquina local, abra o terminal no diretório `PI/backend`.
   - Execute o comando do Prisma para aplicar as migrations diretamente no Supabase:
     ```bash
     DATABASE_URL="postgresql://postgres.[SEU-ID]:[SUA-SENHA]@aws-0-[REGIAO].pooler.supabase.com:5432/postgres" npx prisma migrate deploy
     ```
   - Isto criará a estrutura física de tabelas no Supabase baseada em seu histórico de migrations.
4. **Alimentar o Banco com Dados Iniciais (Seed)**:
   - Execute o script de seed para criar os usuários iniciais (`admin`/`admin123` e `gestao`/`gestao123`) e categorias:
     ```bash
     DATABASE_URL="postgresql://postgres.[SEU-ID]:[SUA-SENHA]@aws-0-[REGIAO].pooler.supabase.com:5432/postgres" npx prisma db seed
     ```

---

### 🖥️ FASE 2: Backend no Koyeb

O Koyeb é uma plataforma moderna e muito simples para rodar aplicações Node.js e Docker em containers persistentes.

1. **Criar a Conta e Conectar o GitHub**:
   - Crie uma conta no [Koyeb](https://www.koyeb.com).
   - Vá no painel do Koyeb e crie um novo **App**.
   - Conecte sua conta do GitHub e selecione o repositório do projeto.
2. **Configurar o Repositório e Build**:
   - **Repository Branch**: `main` (ou a branch de produção correspondente).
   - **Work Directory**: Defina o subdiretório como `PI/backend` (já que o backend está aninhado).
   - **Build Command**: `npm run build` (irá executar `tsc` compilando a pasta `src` para `dist`).
   - **Run Command**: `npm run start` (executará `node dist/index.js`).
3. **Configurar Variáveis de Ambiente**:
   No Koyeb, configure as seguintes variáveis sob a seção **Environment Variables**:
   
   | Nome | Valor / Tipo | Descrição |
   |------|--------------|-----------|
   | `DATABASE_URL` | *Secret* | A Connection String Direta do Supabase obtida na Fase 1 |
   | `JWT_SECRET` | *Secret* | Uma string aleatória longa para assinar seus tokens JWT |
   | `NODE_ENV` | `production` | Define o Express e o Logger em modo de alta performance |
   | `CORS_ORIGIN` | `https://sigti.vercel.app` | A URL de produção que você terá na Vercel (Fase 3) |
   | `LOG_LEVEL` | `info` | Nível de logs do Pino ideal para produção |

4. **Porta**:
   - Exponha a porta `3001` (ou a porta padrão detectada). O Koyeb criará um Proxy HTTPS reverso automático, gerando uma URL segura com SSL como `https://[NOME-APP].koyeb.app`. Copie essa URL.

---

### 🎨 FASE 3: Frontend na Vercel

A Vercel fornecerá hospedagem estática global ultra-rápida via CDN para a nossa aplicação React.

1. **Importar o Projeto**:
   - Vá no painel da [Vercel](https://vercel.com) e conecte com seu GitHub.
   - Clique em **Add New** > **Project** e selecione o mesmo repositório do projeto.
2. **Ajustar as Configurações de Diretório e Build**:
   - **Framework Preset**: `Vite` (deve ser auto-detectado).
   - **Root Directory**: Clique em **Edit** e aponte para `PI/frontend` (a Vercel executará os comandos a partir deste diretório).
   - **Build Command**: `npm run build` (executa `tsc -b && vite build` gerando a pasta `dist`).
   - **Output Directory**: `dist` (padrão do Vite).
3. **Adicionar as Variáveis de Ambiente de Build**:
   Adicione a seguinte variável na seção **Environment Variables** da Vercel:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://[NOME-APP].koyeb.app/api` (A URL HTTPS segura gerada pelo Koyeb na Fase 2 com o sufixo `/api`).
4. **Deploy**:
   - Clique em **Deploy**. A Vercel compilará o React com a URL do backend embutida.
   - Ao finalizar, ela gerará a URL de produção (ex: `https://sigti.vercel.app`).
5. **Ajuste Final (CORS)**:
   - Copie a URL oficial gerada pela Vercel.
   - Volte no painel do **Koyeb**, vá nas configurações do serviço de Backend e atualize a variável `CORS_ORIGIN` para que contenha exatamente essa nova URL da Vercel. O Koyeb redeployará a API automaticamente em segundos.

---

## 🔒 4. Melhores Práticas de Segurança Recomendadas (Pós-Deploy)

Para garantir a integridade dos dados e a segurança da aplicação no ambiente final:

- [ ] **Configuração do CORS**: Garanta que `CORS_ORIGIN` nunca seja configurado como `*`. Isso previne que outros sites façam requisições em nome do usuário.
- [ ] **Segurança de Cookies**: No controller de login, certifique-se de que os cookies contendo tokens de sessão usem as diretivas `httpOnly: true`, `secure: true` (exige HTTPS) e `sameSite: 'strict'` em produção.
- [ ] **SSL Forçado**: Koyeb e Vercel já forçam HTTPS por padrão. Nunca permita tráfego HTTP puro.
- [ ] **Backup do Supabase**: A Premium do Supabase mantém backups diários por 7 dias. Para empresas ou órgãos oficiais (IFAL), configure uma rotina de exportação automática (ex: pg_dump via GitHub Actions mensal) ou assine o plano pago para ter maior retenção de dados históricos.
- [ ] **Limitação de Taxa (Rate Limit)**: O middleware `express-rate-limit` já está configurado para 100 requisições a cada 15 minutos. Caso você use redirecionamento ou API gateway no futuro, garanta que o rate limiter consiga ler o IP real do cliente configurando `app.set('trust proxy', 1)` no express.

---

## 🏁 5. Conclusão e Próximos Passos

A aplicação **SIGTI** está em excelente forma técnica. Com TypeScript estrito compilando com 100% de sucesso, logs limpos, sem rastros de `console.log` em produção, tratamento centralizado de erros e o fluxo de SPA configurado na Vercel via `vercel.json`, o deploy decorrerá de forma extremamente suave e profissional.

Para iniciar, siga a **Fase 1** configurando seu banco de dados no Supabase e use a Connection String obtida para rodar `npx prisma migrate deploy` localmente.

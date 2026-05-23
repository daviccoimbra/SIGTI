import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import path from 'path'
import fs from 'fs'

import cookieParser from 'cookie-parser'

import ticketRoutes from './routes/ticketRoutes.js'
import requesterRoutes from './routes/requesterRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import equipmentRoutes from './routes/equipmentRoutes.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

import {
  authMiddleware,
} from './middlewares/authMiddleware.js'

dotenv.config()

const app = express()

const PORT =
  process.env.PORT || 3001

/**
 * Logger simples
 */
app.use(
  (
    req,
    res,
    next
  ) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url}`
    )

    next()
  }
)

/**
 * CORS
 */
app.use(
  cors({
    origin:
      'http://localhost:5173',

    credentials: true,
  })
)

/**
 * Middlewares globais
 */
app.use(express.json())

app.use(cookieParser())

/**
 * =========================
 * ROTAS PÚBLICAS
 * =========================
 */

app.use(
  '/api/auth',
  authRoutes
)

/**
 * =========================
 * ROTAS PROTEGIDAS
 * =========================
 */

app.use(
  '/api/tickets',
  authMiddleware,
  ticketRoutes
)

app.use(
  '/api/requesters',
  authMiddleware,
  requesterRoutes
)

app.use(
  '/api/categories',
  authMiddleware,
  categoryRoutes
)

app.use(
  '/api/equipments',
  authMiddleware,
  equipmentRoutes
)

app.use(
  '/api/users',
  authMiddleware,
  userRoutes
)

app.use(
  '/api/dashboard',
  authMiddleware,
  dashboardRoutes
)

/**
 * =========================
 * DOWNLOAD DE ARQUIVOS
 * =========================
 */

app.get(
  '/api/archive/:file',

  authMiddleware,

  (
    req,
    res
  ) => {
    try {
      const file =
        decodeURIComponent(
          req.params.file
        )

      /**
       * Diretório base
       */
      const archiveDir =
        path.resolve(
          process.cwd(),
          'archive'
        )

      /**
       * Caminho final
       */
      const filePath =
        path.resolve(
          archiveDir,
          file
        )

      /**
       * Proteção contra path traversal
       */
      if (
        !filePath.startsWith(
          archiveDir
        )
      ) {
        return res
          .status(403)
          .json({
            error:
              'Acesso negado',
          })
      }

      /**
       * Arquivo não existe
       */
      if (
        !fs.existsSync(
          filePath
        )
      ) {
        return res
          .status(404)
          .json({
            error:
              'Arquivo não encontrado',
          })
      }

      /**
       * Envia arquivo
       */
      return res.sendFile(
        filePath
      )
    } catch (err) {
      console.error(err)

      return res
        .status(500)
        .json({
          error:
            'Erro interno',
        })
    }
  }
)

/**
 * =========================
 * START SERVER
 * =========================
 */

app.listen(
  PORT,
  () => {
    console.log(
      `Server is running on port ${PORT}`
    )
  }
)
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable import/first */
import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import { HttpStatusCode } from 'axios'

import { errorMiddleware } from './middlewares/error.middleware'
import { httpLogger } from './logger'

const API_RUNNING = 'API em execução.'
const URL_NOT_FOUND = 'URL não encontrada. Por favor, verifique a URL da requisição e tente novamente.'

dotenv.config()

import { authRouter } from './domains/auth/routes'
import { clientRouter } from './domains/client/routes'
import { memberRouter } from './domains/member/routes'
import { orderRouter } from './domains/order/routes'
import { userRouter } from './domains/user/routes'

const app = express()

app.disable('x-powered-by')
app.use(cors({ exposedHeaders: ['x-total-count', 'access-token'] }))
app.use(express.json())
app.use(helmet())
app.use(httpLogger)

app.use('/api/auth', authRouter)
app.use('/api/client', clientRouter)
app.use('/api/member', memberRouter)
app.use('/api/order', orderRouter)
app.use('/api/user', userRouter)

app.get('/api/health-check', (_req: Request, res: Response) => {
  res.status(HttpStatusCode.Ok).json(API_RUNNING)
})

app.use((_req: Request, res: Response) => {
  res.status(HttpStatusCode.NotFound).json(URL_NOT_FOUND)
})

app.use(errorMiddleware)

export { app }

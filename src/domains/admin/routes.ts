/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsMaster } from '../../middlewares/authorization.middleware'
import adminControllers from './controllers'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'

const adminRouter: Router = Router()

// Recuperar quantidade de clientes
adminRouter.get(
  '/admin/client/count',
  verifyAccessToken,
  checkIfIsMaster,
  adminControllers.countClients
)

// Recuperar faturamento e inadimplência
adminRouter.get(
  '/admin/revenue',
  verifyAccessToken,
  checkIfIsMaster,
  adminControllers.getRevenue
)

export { adminRouter }

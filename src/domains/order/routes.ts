/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsMaster } from '../../middlewares/authorization.middleware'
import orderController from './controller'
import orderMiddlewares from './middlewares'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'
import { validateUuidParam } from '../../middlewares/validateUuidParam.middleware'

const orderRouter: Router = Router()

// Criar pedido
orderRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsMaster,
  orderMiddlewares.validateCreateOnePayload,
  orderController.createOne
)

// Ativar pedido
orderRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  orderController.activateOne
)

// Inativar pedido
orderRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  orderController.inactivateOne
)

// Excluir pedido
orderRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  orderController.deleteOne
)

// Editar pedido
// orderRouter.patch(
//   '/:id',
//   verifyAccessToken,
//   checkIfIsMaster,
//   validateUuidParam,
//   orderController.updateOne
// )

export { orderRouter }

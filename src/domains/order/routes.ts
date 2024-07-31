/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsAdmin } from '../../middlewares/authorization.middleware'
import orderController from './controller'
import orderMiddlewares from './middlewares'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'
import { validateIdParam } from '../../middlewares/validateIdParam.middleware'

const orderRouter: Router = Router()

// Criar pedido
orderRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsAdmin,
  orderMiddlewares.validateCreateOnePayload,
  orderController.createOne
)

// Ativar pedido
orderRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  orderController.activateOne
)

// Inativar pedido
orderRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  orderController.inactivateOne
)

// Excluir pedido
orderRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  orderController.deleteOne
)

// Editar pedido
// orderRouter.patch(
//   '/:id',
//   verifyAccessToken,
//   checkIfIsAdmin,
//   validateIdParam,
//   orderController.updateOne
// )

export { orderRouter }

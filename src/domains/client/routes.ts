/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsAdmin } from '../../middlewares/authorization.middleware'
import clientController from './controllers'
import clientMiddlewares from './middlewares'
import { validateIdParam } from '../../middlewares/validateIdParam.middleware'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'

const clientRouter: Router = Router()

// Criar cliente
clientRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsAdmin,
  clientMiddlewares.validateCreateOnePayload,
  clientController.createOne
)

// Detalhes de um cliente
clientRouter.get(
  '/:id',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  clientController.findOneById
)

// Listar clientes
clientRouter.get(
  '/',
  verifyAccessToken,
  checkIfIsAdmin,
  clientMiddlewares.validateFindManyQueryParams,
  clientController.findMany
)

// Ativar cliente
clientRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  clientController.activateOne
)

// Inativar cliente
clientRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  clientController.inactivateOne
)

// Marcar cliente como inadimplente
clientRouter.patch(
  '/:id/set-as-defaulting',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  clientController.setOneAsDefaulting
)

// Excluir cliente
clientRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  clientController.deleteOne
)

// Editar cliente
clientRouter.patch(
  '/:id',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  clientMiddlewares.validateUpdateOnePayload,
  clientController.updateOne
)

export { clientRouter }

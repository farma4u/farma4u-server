/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsMaster } from '../../middlewares/authorization.middleware'
import clientController from './controllers'
import clientMiddlewares from './middlewares'
import { validateUuidParam } from '../../middlewares/validateUuidParam.middleware'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'

const clientRouter: Router = Router()

// Criar cliente
clientRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsMaster,
  clientMiddlewares.validateCreateOnePayload,
  clientController.createOne
)

// Detalhes de um cliente
clientRouter.get(
  '/:id',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  clientController.findOneById
)

// Listar clientes
clientRouter.get(
  '/',
  verifyAccessToken,
  checkIfIsMaster,
  clientMiddlewares.validateFindManyQueryParams,
  clientController.findMany
)

// Ativar cliente
clientRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  clientController.activateOne
)

// Inativar cliente
clientRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  clientController.inactivateOne
)

// Marcar cliente como inadimplente
clientRouter.patch(
  '/:id/set-as-defaulting',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  clientController.setOneAsDefaulting
)

// Excluir cliente
clientRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  clientController.deleteOne
)

// Editar cliente
clientRouter.patch(
  '/:id',
  verifyAccessToken,
  checkIfIsMaster,
  validateUuidParam,
  clientMiddlewares.validateUpdateOnePayload,
  clientController.updateOne
)

export { clientRouter }

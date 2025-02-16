/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsMasterOrClient } from '../../middlewares/authorization.middleware'
import userControllers from './controllers'
import userMiddlewares from './middlewares'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'
import { validateUuidParam } from '../../middlewares/validateUuidParam.middleware'

const userRouter: Router = Router()

// Criar usuário
userRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  userMiddlewares.manageUserAuthorization,
  userMiddlewares.validateCreateOnePayload,
  userControllers.createOne
)

// Criar usuário sem validações
userRouter.post(
  '/unvalidated',
  userMiddlewares.validateCreateOnePayload,
  userControllers.createOne
)

// Detalhes de um usuário
userRouter.get(
  '/:id',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  validateUuidParam,
  userControllers.findOneById
)

// Listar usuários
userRouter.get(
  '/',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  userMiddlewares.findManyQueryParamsValidation,
  userControllers.findMany
)

// Ativar usuário
userRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  userMiddlewares.manageUserAuthorization,
  validateUuidParam,
  userControllers.activateOne
)

// Inativar usuário
userRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  userMiddlewares.manageUserAuthorization,
  validateUuidParam,
  userControllers.inactivateOne
)

// Excluir usuário
userRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  userMiddlewares.manageUserAuthorization,
  validateUuidParam,
  userControllers.deleteOne
)

// Editar usuário
userRouter.patch(
  '/:id',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  userMiddlewares.manageUserAuthorization,
  validateUuidParam,
  userMiddlewares.updateOnePayloadValidation,
  userControllers.updateOne
)

export { userRouter }

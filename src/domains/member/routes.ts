/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsMasterOrClient, checkIfIsMasterOrClientOrMember } from '../../middlewares/authorization.middleware'
import memberController from './controllers'
import memberMiddlewares from './middlewares'
import { validateUuidParam } from '../../middlewares/validateUuidParam.middleware'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'
import multer from 'multer'
import { multerOptions } from '../../utils/multerOptions'

const memberRouter: Router = Router()

// Criar associado
memberRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  memberMiddlewares.checkIfIsSameClientId,
  memberMiddlewares.validateCreateOnePayload,
  memberController.createOne
)

// Criar associados a partir de um arquivo CSV
memberRouter.post(
  '/:clientId/create-members-in-bulk',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  memberMiddlewares.checkIfIsSameClientId,
  memberMiddlewares.validateCreateManyPayload,
  multer(multerOptions).single('file'), // salva a imagem e a disponibiliza em req.file
  memberController.createMany
)

// Buscar associado por CPF
memberRouter.get(
  '/by-cpf/:cpf',
  memberMiddlewares.validateMemberCpfToken,
  memberController.findOneByCpf
)

// Detalhes de um associado
memberRouter.get(
  '/:id',
  verifyAccessToken,
  checkIfIsMasterOrClientOrMember,
  validateUuidParam,
  memberMiddlewares.checkIfIsSameMemberId,
  memberController.findOneById
)

// Listar associados
memberRouter.get(
  '/',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  memberMiddlewares.validatefindManyQueryParams,
  memberController.findMany
)

// Ativar associado
memberRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  validateUuidParam,
  memberMiddlewares.checkIfIsSameClientId,
  memberController.activateOne
)

// Inativar associado
memberRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  validateUuidParam,
  memberMiddlewares.checkIfIsSameClientId,
  memberController.inactivateOne
)

// Excluir associado
memberRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  validateUuidParam,
  memberMiddlewares.checkIfIsSameClientId,
  memberController.deleteOne
)

// Editar associado
memberRouter.patch(
  '/:id',
  verifyAccessToken,
  checkIfIsMasterOrClient,
  validateUuidParam,
  memberMiddlewares.checkIfIsSameClientId,
  memberMiddlewares.validateUpdateOnePayload,
  memberController.updateOne
)

export { memberRouter }

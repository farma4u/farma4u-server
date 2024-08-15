/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsAdmin, checkIfIsAdminOrMember } from '../../middlewares/authorization.middleware'
import memberController from './controllers'
import memberMiddlewares from './middlewares'
import { validateIdParam } from '../../middlewares/validateIdParam.middleware'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'
import multer from 'multer'
import { multerOptions } from '../../utils/multerOptions'

const memberRouter: Router = Router()

// Criar associado
memberRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsAdmin,
  memberMiddlewares.validateCreateOnePayload,
  memberController.createOne
)

// Criar associados a partir de um arquivo CSV
memberRouter.post(
  '/:clientId/create-members-in-bulk',
  verifyAccessToken,
  checkIfIsAdmin,
  memberMiddlewares.validateCreateManyPayload,
  multer(multerOptions).single('file'), // salva a imagem e a disponibiliza em req.file
  memberController.createMany
)

// Detalhes de um associado
memberRouter.get(
  '/:id',
  verifyAccessToken,
  checkIfIsAdminOrMember,
  validateIdParam,
  memberController.findOneById
)

// Listar associados
memberRouter.get(
  '/',
  verifyAccessToken,
  checkIfIsAdmin,
  memberMiddlewares.validatefindManyQueryParams,
  memberController.findMany
)

// Ativar associado
memberRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  memberController.activateOne
)

// Inativar associado
memberRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  memberController.inactivateOne
)

// Excluir associado
memberRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  memberController.deleteOne
)

// Editar associado
memberRouter.patch(
  '/:id',
  verifyAccessToken,
  checkIfIsAdmin,
  validateIdParam,
  memberMiddlewares.validateUpdateOnePayload,
  memberController.updateOne
)

export { memberRouter }

/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import { checkIfIsAdmin } from '../../middlewares/authorization.middleware'
import userController from './controllers'
import userMiddlewares from './middlewares'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'

const userRouter: Router = Router()

userRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsAdmin,
  userMiddlewares.validateCreateOnePayload,
  userController.createOne
)

export { userRouter }

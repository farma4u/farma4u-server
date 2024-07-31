/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import authController from './controllers'
import authMiddlewares from './middlewares'

const authRouter: Router = Router()

authRouter.post(
  '/login-admin',
  authMiddlewares.validateLoginPayload,
  authController.loginAdmin
)

authRouter.post(
  '/login-member',
  authMiddlewares.validateLoginPayload,
  authController.loginMember
)

authRouter.post(
  '/member-first-access',
  authMiddlewares.validateMemberFirstAccessPayload,
  authController.createMemberFirstAccess
)

authRouter.post(
  '/member-first-password',
  authMiddlewares.validateMemberFirstPasswordPayload,
  authController.createMemberFirstPassword
)

export { authRouter }

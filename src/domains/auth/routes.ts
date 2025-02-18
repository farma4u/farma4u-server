/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'

import authControllers from './controllers'
import authMiddlewares from './middlewares'

const authRouter: Router = Router()

// Login de usuário
authRouter.post(
  '/user/login',
  authMiddlewares.validateLoginPayload,
  authControllers.loginUser
)

// Solicitar redefinição de senha de usuário
authRouter.post(
  '/user/request-reset-password',
  authMiddlewares.requestResetPasswordPayloadValidation,
  authControllers.requestResetUserPassword
)

// Redefinir senha de usuário
authRouter.post(
  '/user/reset-password',
  authMiddlewares.resetPasswordPayloadValidation,
  authControllers.resetUserPassword
)

authRouter.post(
  '/login-member',
  authMiddlewares.validateLoginPayload,
  authControllers.loginMember
)

authRouter.post(
  '/member-first-access',
  authMiddlewares.validateMemberFirstAccessPayload,
  authControllers.createMemberFirstAccess
)

authRouter.post(
  '/member-first-password',
  authMiddlewares.validateMemberFirstPasswordPayload,
  authControllers.createMemberFirstPassword
)

export { authRouter }

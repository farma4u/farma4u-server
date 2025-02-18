import { HttpStatusCode } from 'axios'
import { type Request, type Response } from 'express'

import authServices from './services'

const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const SUCCESSFULLY_LOGGED_IN = 'Usuário logado com sucesso.'

  const { cpf, password }: { cpf: string, password: string } = req.body

  const { accessToken, user } = await authServices.loginUser(cpf, password)

  res.setHeader('access-token', accessToken)

  return res.status(HttpStatusCode.Ok).json({ message: SUCCESSFULLY_LOGGED_IN, user })
}

const loginMember = async (req: Request, res: Response): Promise<Response> => {
  const SUCCESSFULLY_LOGGED_IN = 'Associado logado com sucesso.'

  const { cpf, password }: { cpf: string, password: string } = req.body

  const { accessToken, user } = await authServices.loginMember(cpf, password)

  res.setHeader('access-token', accessToken)

  return res.status(HttpStatusCode.Ok).json({ message: SUCCESSFULLY_LOGGED_IN, user })
}

const createMemberFirstAccess = async (req: Request, res: Response): Promise<Response> => {
  const SUCCESSFULLY_FIRST_ACCESS = 'Primeiro acesso realizado com sucesso. Por favor, verifique o código de acesso enviado em seu email.'

  const { cpf }: { cpf: string } = req.body

  await authServices.createMemberFirstAccess(cpf)

  return res.status(HttpStatusCode.Ok).json({ message: SUCCESSFULLY_FIRST_ACCESS })
}

const createMemberFirstPassword = async (req: Request, res: Response): Promise<Response> => {
  const FIRST_PASSWORD_SUCCESSFULLY_CREATED = 'Senha criada com sucesso!'

  const { cpf, firstAccessCode, newPassword }: { cpf: string, firstAccessCode: string, newPassword: string } = req.body

  await authServices.createMemberFirstPassword(cpf, firstAccessCode, newPassword)

  return res.status(HttpStatusCode.Created).json({ message: FIRST_PASSWORD_SUCCESSFULLY_CREATED })
}

async function requestResetUserPassword (req: Request, res: Response): Promise<Response> {
  const RESET_PASSWORD_REQUESTED_SUCCESSFULLY = 'Redefinição de senha requisitada com sucesso. Por favor, verifique o código de acesso enviado em seu email.'

  const { cpf }: { cpf: string } = req.body

  await authServices.requestResetUserPassword(cpf)

  return res.status(HttpStatusCode.Ok).json({ message: RESET_PASSWORD_REQUESTED_SUCCESSFULLY })
}

async function resetUserPassword (req: Request, res: Response): Promise<Response> {
  const RESET_PASSWORD_SUCCESSFULLY_CREATED = 'Senha redefinida com sucesso!'

  const { cpf, resetPasswordCode, newPassword }: { cpf: string, resetPasswordCode: string, newPassword: string } = req.body

  await authServices.resetUserPassword(cpf, resetPasswordCode, newPassword)

  return res.status(HttpStatusCode.Created).json({ message: RESET_PASSWORD_SUCCESSFULLY_CREATED })
}

export default {
  createMemberFirstAccess,
  createMemberFirstPassword,
  loginUser,
  loginMember,
  requestResetUserPassword,
  resetUserPassword
}

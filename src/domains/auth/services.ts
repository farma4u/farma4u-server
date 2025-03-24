import * as bcrypt from 'bcrypt'
import { createSecretKey, randomBytes } from 'node:crypto'
import { SignJWT } from 'jose'

import { BadRequestError, InternalServerError, UnauthorizedError } from '../../errors'
import { getEnvironmentVariable } from '../../utils/getEnvironmentVariable'
import type { IMemberLoginResponse, IUserLoginResponse } from './interfaces'
import memberRepositories from '../member/repositories'
import { role } from '../../enums/roleEnum'
import { sendEmail } from '../../utils/mailer'
import userRepositories from '../user/repositories'
import type { AccessTokenData } from '../../interfaces'
import { status } from '../../enums/statusEnum'

const generateAccessToken = async (accessTokenData: AccessTokenData): Promise<string> => {
  const JWT_SECRET = getEnvironmentVariable('JWT_SECRET')
  const JWT_ISSUER = getEnvironmentVariable('JWT_ISSUER')
  const JWT_AUDIENCE = getEnvironmentVariable('JWT_AUDIENCE')

  const secretKey = createSecretKey(JWT_SECRET, 'utf8')

  const { id, clientId, roleId } = accessTokenData

  const accessToken = await new SignJWT({ id, clientId, roleId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('120m')
    .sign(secretKey)

  return accessToken
}

const loginUser = async (cpf: string, password: string): Promise<IUserLoginResponse> => {
  const BAD_CREDENTIALS = 'Credenciais inválidas.'
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const user = await userRepositories.findOne({ cpf }, { statusId: status.ACTIVE })

  if (user === null || (user.role.id !== role.MASTER && user.role.id !== role.CLIENT_ADMIN)) {
    logger.error({ cpf }, USER_NOT_FOUND)

    throw new UnauthorizedError(BAD_CREDENTIALS)
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) throw new UnauthorizedError(BAD_CREDENTIALS)

  const { id, client, role: { id: roleId } } = user

  const accessToken = await generateAccessToken({
    id,
    clientId: client === null ? '' : client.id,
    roleId
  })

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      roleId: user.role.id,
      client: user.client
    }
  }
}

async function generateResetPasswordCode (userId: string): Promise<string> {
  const resetPasswordCode = randomBytes(3).toString('hex')

  const encryptedResetPasswordCode = await bcrypt.hash(resetPasswordCode, 10)

  await userRepositories.upsertOneResetPasswordCode(userId, encryptedResetPasswordCode)

  return resetPasswordCode
}

async function sendResetPasswordCode (email: string, resetPasswordCode: string, name: string): Promise<void> {
  const SUBJECT = 'Farma - Redefina sua senha!'
  // const BODY = `Olá, ${name}! Seu código de acesso é: ${resetPasswordCode}. Utilize-o para redefinir sua senha.`
  const BODY_HTML = `<!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de senha</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <header style="background-color: #5CC9FA; padding: 4px 0; border-radius: 0 0 15px 15px;min-height: 75px;display: flex;align-items: center;justify-content: center;">
      <h1 style="text-align: center; color: white; font-size: x-large;font-weight: normal;">Olá, <strong>${name}</strong>!</h1>
    </header>
    <main style="padding: 1rem 1.5rem;text-align: center;">
      <p>Para redefinir a sua senha, insira o seguinte código na plataforma:</p>
      <div style="width: 70%;margin: 2rem auto;background-color: #f0f0f0;border-radius: 15px;padding: 1rem;">
        <h2 style="text-align: center; color: #EA6AD1; font-size: x-large;">${resetPasswordCode}</h2>
      </div>
    </main>
    <footer style="padding: 1rem 1.5rem;border-top: 1px solid #EA6AD1;text-align: center;">
      <p>Se você não solicitou esta redefinição de senha, por favor, ignore este e-mail.</p>
    </footer>
  </body>
  </html>`

  const mailSent = await sendEmail(SUBJECT, BODY_HTML, email)

  logger.debug(mailSent, 'Resposta do envio do email.')
}

async function requestResetUserPassword (cpf: string): Promise<void> {
  const USER_NOT_FOUND = 'Usuário não encontrado.'
  const USER_EMAIL_NOT_FOUND = 'Usuário não possui email cadastrado.'

  const user = await userRepositories.findOne({ cpf }, { statusId: status.ACTIVE })

  if (user === null) throw new UnauthorizedError(USER_NOT_FOUND)
  if (user.email === null) throw new UnauthorizedError(USER_EMAIL_NOT_FOUND)

  const resetPasswordCode = await generateResetPasswordCode(user.id)

  await sendResetPasswordCode(user.email, resetPasswordCode, user.name ?? '')

  logger.debug({ resetPasswordCode }, 'Código de acesso gerado.')
}

async function resetUserPassword (cpf: string, resetPasswordCode: string, newPassword: string): Promise<void> {
  const INVALID_RESET_PASSWORD_CODE = 'Código de redefinição de senha inválido.'
  const USER_DID_NOT_REQUESTED_PASSWORD_RESET = 'Usuário ainda não requisitou o código de redefinição de senha.'
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const user = await userRepositories.findOne({ cpf }, { statusId: status.ACTIVE })

  if (user === null) throw new UnauthorizedError(USER_NOT_FOUND)

  const resetPasswordCodeData = await userRepositories.findOneResetPasswordCode(user.id)

  if (resetPasswordCodeData === null) throw new BadRequestError(USER_DID_NOT_REQUESTED_PASSWORD_RESET)

  const encryptedResetPasswordCode = resetPasswordCodeData.resetCode

  const isResetPasswordCodeValid = await bcrypt.compare(resetPasswordCode, encryptedResetPasswordCode)

  if (!isResetPasswordCodeValid) throw new UnauthorizedError(INVALID_RESET_PASSWORD_CODE)

  const encryptedPassword = await bcrypt.hash(newPassword, 10)

  await userRepositories.updateOne(user.id, { password: encryptedPassword })

  await userRepositories.deleteOneResetPasswordCode(user.id)
}

const loginMember = async (cpf: string, password: string): Promise<IMemberLoginResponse> => {
  const BAD_CREDENTIALS = 'Credenciais inválidas.'
  const MEMBER_NOT_FOUND = 'Associado não encontrado.'
  const MEMBER_WITHOUT_PASSWORD = 'Associado ainda não criou a senha. Por favor, realize o primeiro acesso.'

  const member = await memberRepositories.findOneByCpf(cpf)

  if (member === null) {
    logger.error({ cpf }, MEMBER_NOT_FOUND)

    throw new UnauthorizedError(BAD_CREDENTIALS)
  }

  if (!member.createdPassword || member.password === null) throw new UnauthorizedError(MEMBER_WITHOUT_PASSWORD)

  const isPasswordValid = await bcrypt.compare(password, member.password)

  if (!isPasswordValid) throw new UnauthorizedError(BAD_CREDENTIALS)

  const { id, client } = member

  const accessToken = await generateAccessToken({
    id,
    clientId: client === null ? '' : client.id,
    roleId: role.MEMBER
  })

  return {
    accessToken,
    user: {
      id: member.id,
      name: member.name,
      roleId: role.MEMBER,
      client: member.client
    }
  }
}

const generateFirstAccessCode = async (memberId: string): Promise<string> => {
  const firstAccessCode = randomBytes(3).toString('hex')

  const encryptedFirstAccessCode = await bcrypt.hash(firstAccessCode, 10)

  await memberRepositories.upsertOneFirstAccessCode(memberId, encryptedFirstAccessCode)

  return firstAccessCode
}

const sendFirstAccessCode = async (email: string, firstAccessCode: string, name: string): Promise<void> => {
  const SUBJECT = 'Farma - Crie sua senha de acesso!'
  // const BODY = `Olá, ${name}! Seu código de acesso é: ${firstAccessCode}. Utilize-o para redefinir sua senha.`
  const BODY_HTML = `<!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criação de senha</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <header style="background-color: #5CC9FA; padding: 4px 0; border-radius: 0 0 15px 15px;min-height: 75px;display: flex;align-items: center;justify-content: center;">
      <h1 style="text-align: center; color: white; font-size: x-large;font-weight: normal;">Olá, <strong>${name}</strong>!</h1>
    </header>
    <main style="padding: 1rem 1.5rem;text-align: center;">
      <p>Para finalizar o seu cadastro, insira o seguinte código na plataforma:</p>
      <div style="width: 70%;margin: 2rem auto;background-color: #f0f0f0;border-radius: 15px;padding: 1rem;">
        <h2 style="text-align: center; color: #EA6AD1; font-size: x-large;">${firstAccessCode}</h2>
      </div>
    </main>
    <footer style="padding: 1rem 1.5rem;border-top: 1px solid #EA6AD1;text-align: center;">
      <p>Se você não solicitou este cadastro, por favor, ignore este e-mail.</p>
    </footer>
  </body>
  </html>`

  const mailSent = await sendEmail(SUBJECT, BODY_HTML, email)

  logger.debug(mailSent, 'Resposta do envio do email.')
}

const createMemberFirstAccess = async (cpf: string): Promise<void> => {
  // const USER_ALREADY_HAS_PASSWORD = 'Usuário já possui senha de acesso.'
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const member = await memberRepositories.findOneByCpf(cpf)

  if (member === null) throw new UnauthorizedError(USER_NOT_FOUND)
  // if (member.createdPassword) throw new UnauthorizedError(USER_ALREADY_HAS_PASSWORD)
  await memberRepositories.updateOne(member.id, { createdPassword: false })

  const firstAccessCode = await generateFirstAccessCode(member.id)

  if (member.email === null) throw new InternalServerError('O associado não possui email cadastrado.')

  await sendFirstAccessCode(member.email, firstAccessCode, member.name)

  logger.debug({ firstAccessCode }, 'Código de acesso gerado.')
}

const createMemberFirstPassword = async (cpf: string, firstAccessCode: string, newPassword: string): Promise<void> => {
  const INVALID_FIRST_ACCESS_CODE = 'Código de primeiro acesso inválido.'
  const USER_ALREADY_HAS_PASSWORD = 'Usuário já possui senha de acesso.'
  const USER_DID_NOT_CREATE_FIRST_ACCESS = 'Usuário ainda não realizou o primeiro acesso.'
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const member = await memberRepositories.findOneByCpf(cpf)

  if (member === null) throw new UnauthorizedError(USER_NOT_FOUND)
  if (member.createdPassword) throw new UnauthorizedError(USER_ALREADY_HAS_PASSWORD)

  const firstAccessCodeData = await memberRepositories.findOneFirstAccessCode(member.id)

  if (firstAccessCodeData === null) throw new BadRequestError(USER_DID_NOT_CREATE_FIRST_ACCESS)

  const encryptedFirstAccessCode = firstAccessCodeData.firstAccessCode

  const isFirstAccessCodeValid = await bcrypt.compare(firstAccessCode, encryptedFirstAccessCode)

  if (!isFirstAccessCodeValid) throw new UnauthorizedError(INVALID_FIRST_ACCESS_CODE)

  const encryptedPassword = await bcrypt.hash(newPassword, 10)

  await memberRepositories.updateOne(member.id, { password: encryptedPassword, createdPassword: true })

  await memberRepositories.deleteOneFirstAccessCode(member.id)
}

export default {
  createMemberFirstAccess,
  createMemberFirstPassword,
  loginUser,
  loginMember,
  requestResetUserPassword,
  resetUserPassword
}

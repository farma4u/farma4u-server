import * as bcrypt from 'bcrypt'
import { createSecretKey, randomBytes } from 'node:crypto'
import { SignJWT } from 'jose'

import { BadRequestError, InternalServerError, UnauthorizedError } from '../../errors'
import { getEnvironmentVariable } from '../../utils/getEnvironmentVariable'
import { type ILoginResponse } from './interfaces'
import memberRepositories from '../member/repositories'
import { role } from '../../enums/roleEnum'
import { sendEmail } from '../../utils/mailer'
import userRepositories from '../user/repositories'

const generateAccessToken = async (id: string, roleId: number): Promise<string> => {
  const JWT_SECRET = getEnvironmentVariable('JWT_SECRET')
  const JWT_ISSUER = getEnvironmentVariable('JWT_ISSUER')
  const JWT_AUDIENCE = getEnvironmentVariable('JWT_AUDIENCE')

  const secretKey = createSecretKey(JWT_SECRET, 'utf8')

  const accessToken = await new SignJWT({ id, roleId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('120m')
    .sign(secretKey)

  return accessToken
}

const loginAdmin = async (cpf: string, password: string): Promise<ILoginResponse> => {
  const BAD_CREDENTIALS = 'Credenciais inválidas.'
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const user = await userRepositories.findOneByCpf(cpf)

  if (user === null || user.roleId !== role.ADMIN) {
    logger.error({ cpf }, USER_NOT_FOUND)

    throw new UnauthorizedError(BAD_CREDENTIALS)
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) throw new UnauthorizedError(BAD_CREDENTIALS)

  const accessToken = await generateAccessToken(user.id, user.roleId)

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      roleId: user.roleId
    }
  }
}

const loginMember = async (cpf: string, password: string): Promise<ILoginResponse> => {
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

  const accessToken = await generateAccessToken(member.id, role.MEMBER)

  return {
    accessToken,
    user: {
      id: member.id,
      name: member.name,
      roleId: role.MEMBER
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
  const SUBJECT = 'Farma4u - Crie sua senha de acesso!'
  const BODY = `Olá, ${name}! Seu código de acesso é: ${firstAccessCode}`

  const mailSent = await sendEmail(SUBJECT, BODY, email)

  logger.debug(mailSent, 'Resposta do envio do email.')
}

const createMemberFirstAccess = async (cpf: string): Promise<void> => {
  const USER_ALREADY_HAS_PASSWORD = 'Usuário já possui senha de acesso.'
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const member = await memberRepositories.findOneByCpf(cpf)

  if (member === null) throw new UnauthorizedError(USER_NOT_FOUND)
  if (member.createdPassword) throw new UnauthorizedError(USER_ALREADY_HAS_PASSWORD)

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
  loginAdmin,
  loginMember
}

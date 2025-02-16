import { type NextFunction, type Request, type Response } from 'express'
import { z } from 'zod'

import { BadRequestError, ForbiddenError, GenericError, NotFoundError } from '../../errors'
import { role } from '../../enums/roleEnum'
import { status } from '../../enums/statusEnum'
import userRepositories from './repositories'

const validateCreateOnePayload = (req: Request, _res: Response, next: NextFunction): void => {
  const createOnePayloadSchema = z.object({
    clientId: z
      .string({
        invalid_type_error: 'O campo Id do Cliente ("clientId") deve ser uma string.',
        required_error: 'O campo Id do Cliente ("clientId") é obrigatório.'
      })
      .uuid({
        message: 'O campo Id do Cliente ("clientId") deve ser um UUID válido.'
      })
      .nullable(),
    cpf: z
      .string({
        invalid_type_error: 'O campo CPF ("cpf") deve ser uma string.',
        required_error: 'O campo CPF ("cpf") é obrigatório.'
      })
      .length(11, {
        message: 'O campo CPF ("cpf") deve ter 11 caracteres.'
      }),

    email: z
      .string({
        invalid_type_error: 'O campo E-mail ("email") deve ser uma string.',
        required_error: 'O campo E-mail ("email") é obrigatório.'
      })
      .email({
        message: 'O campo E-mail ("email") deve ser um e-mail válido.'
      }),

    name: z
      .string({
        invalid_type_error: 'O campo Nome ("name") deve ser uma string.',
        required_error: 'O campo Nome ("name") é obrigatório.'
      })
      .min(3, {
        message: 'O campo Nome ("name") deve ter pelo menos 3 caracteres.'
      }),

    password: z
      .string({
        invalid_type_error: 'O campo Senha ("password") deve ser uma string.',
        required_error: 'O campo Senha ("password") é obrigatório.'
      })
      .min(8, {
        message: 'O campo Senha ("password") deve ter pelo menos 8 caracteres.'
      }),

    roleId: z
      .number({
        invalid_type_error: 'O campo Cargo ("roleId") deve ser um number.',
        required_error: 'O campo Cargo ("roleId") é obrigatório.'
      })
      .gte(2, {
        message: 'O campo Cargo ("roleId") deve ser 2 (MASTER) ou 3 (CLIENT_ADMIN).'
      })
      .lte(3, {
        message: 'O campo Cargo ("roleId") deve ser 2 (MASTER) ou 3 (CLIENT_ADMIN).'
      })
  })

  try {
    createOnePayloadSchema.parse({
      clientId: req.body.clientId,
      cpf: req.body.cpf,
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      roleId: req.body.roleId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  if (
    (req.body.roleId === role.CLIENT_ADMIN) &&
    (req.body.clientId === null)
  ) throw new BadRequestError('Ao criar um usuário Admin de Cliente ("roleId" = 3), um Id de Cliente ("clientId") deve ser informado.')

  next()
}

function checkIfIsCreatingMaster (userToBeManagedRoleId: number): void {
  if (userToBeManagedRoleId === role.MASTER) throw new ForbiddenError('Usuários de cliente não podem gerenciar usuários master.')
}

function checkIfIsSameClientId (requestUserClientId: string, userToBeManagedClientId: string): void {
  if (requestUserClientId !== userToBeManagedClientId) {
    throw new ForbiddenError('Operação não permitida. Usuários Admin de Cliente somente podem gerenciar usuários para o mesmo Cliente.')
  }
}

async function manageUserAuthorization (req: Request, _res: Response, next: NextFunction): Promise<void> {
  const requestUserClientId = req.headers['request-user-client-id'] as string
  const requestUserRoleId = JSON.parse(req.headers['request-user-role-id'] as string)
  let userToBeManagedClientId = req.body.clientId as string
  let userToBeManagedRoleId = req.body.roleId as number

  if (requestUserRoleId === role.CLIENT_ADMIN) {
    if (userToBeManagedClientId === undefined || userToBeManagedRoleId === undefined) {
      const user = await userRepositories.findOne({ id: req.params.id }, { statusId: status.ACTIVE })

      if (user === null) throw new NotFoundError('Usuário não encontrado.')
      if (user.client === null) throw new ForbiddenError('Usuários de cliente não podem gerenciar usuários master.') // client somente é null para usuários master

      userToBeManagedClientId = user.client.id
      userToBeManagedRoleId = user.role.id
    }

    checkIfIsCreatingMaster(userToBeManagedRoleId)
    checkIfIsSameClientId(requestUserClientId, userToBeManagedClientId)
  }

  next()
}

function findManyQueryParamsValidation (req: Request, _res: Response, next: NextFunction): void {
  const findManyQueryParamsSchema = z.object({
    searchInput: z
      .string({
        invalid_type_error: 'O campo Busca ("searchInput") deve ser uma string.',
        required_error: 'O campo Busca ("searchInput") é obrigatório.'
      })
      .optional(),

    take: z
      .number({
        invalid_type_error: 'O campo Quantidade de Registros ("take") deve ser um number.',
        required_error: 'O campo Quantidade de Registros ("take") é obrigatório.'
      })
      .gte(1, {
        message: 'O campo Quantidade de Registros ("take") deve ser maior que 0.'
      })
      .lte(50, {
        message: 'O campo Quantidade de Registros ("take") deve ser menor ou igual a 50.'
      })
      .optional(),

    skip: z
      .number({
        invalid_type_error: 'O campo Pular Registros ("skip") deve ser um number.',
        required_error: 'O campo Pular Registros ("skip") é obrigatório.'
      })
      .gte(0, {
        message: 'O campo Pular Registros ("skip") deve ser maior ou igual a 0.'
      })
      .optional(),

    statusId: z
      .number({
        invalid_type_error: 'O campo Status ("statusId") deve ser um number.',
        required_error: 'O campo Status ("statusId") é obrigatório.'
      })
      .gte(1, {
        message: 'O campo Status ("statusId") deve 1 (ativo), 2 (inativo) ou 3 (excluído).'
      })
      .lte(3, {
        message: 'O campo Status ("statusId") deve 1 (ativo), 2 (inativo) ou 3 (excluído).'
      })
      .optional()
  })

  try {
    findManyQueryParamsSchema.parse({
      searchInput: req.query['search-input'],
      skip: typeof req.query.skip === 'string' ? parseInt(req.query.skip) : undefined,
      statusId: typeof req.query['status-id'] === 'string' ? parseInt(req.query['status-id']) : undefined,
      take: typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  next()
}

function updateOnePayloadValidation (req: Request, _res: Response, next: NextFunction): void {
  const createOnePayloadSchema = z.object({
    clientId: z
      .string({
        invalid_type_error: 'O campo Id do Cliente ("clientId") deve ser uma string.',
        required_error: 'O campo Id do Cliente ("clientId") é obrigatório.'
      })
      .uuid({
        message: 'O campo Id do Cliente ("clientId") deve ser um UUID válido.'
      })
      .nullable(),

    email: z
      .string({
        invalid_type_error: 'O campo E-mail ("email") deve ser uma string.',
        required_error: 'O campo E-mail ("email") é obrigatório.'
      })
      .email({
        message: 'O campo E-mail ("email") deve ser um e-mail válido.'
      }),

    name: z
      .string({
        invalid_type_error: 'O campo Nome ("name") deve ser uma string.',
        required_error: 'O campo Nome ("name") é obrigatório.'
      })
      .min(3, {
        message: 'O campo Nome ("name") deve ter pelo menos 3 caracteres.'
      }),

    roleId: z
      .number({
        invalid_type_error: 'O campo Cargo ("roleId") deve ser um number.',
        required_error: 'O campo Cargo ("roleId") é obrigatório.'
      })
      .gte(2, {
        message: 'O campo Cargo ("roleId") deve ser 2 (MASTER) ou 3 (CLIENT_ADMIN).'
      })
      .lte(3, {
        message: 'O campo Cargo ("roleId") deve ser 2 (MASTER) ou 3 (CLIENT_ADMIN).'
      })
  })

  try {
    createOnePayloadSchema.parse({
      clientId: req.body.clientId,
      email: req.body.email,
      name: req.body.name,
      roleId: req.body.roleId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  next()
}

export default {
  manageUserAuthorization,
  validateCreateOnePayload,
  findManyQueryParamsValidation,
  updateOnePayloadValidation
}

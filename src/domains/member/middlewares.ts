import { type NextFunction, type Request, type Response } from 'express'
import { z } from 'zod'

import { BadRequestError, GenericError } from '../../errors'

const validateCreateOnePayload = (req: Request, _res: Response, next: NextFunction): void => {
  const createOnePayloadSchema = z.object({
    birthDate: z
      .string({
        invalid_type_error: 'O campo Data de Nascimento ("birthDate") deve ser uma string no formato AAAA-MM-DD.',
        required_error: 'O campo Data de Nascimento ("birthDate") é obrigatório e deve estar no formato AAAA-MM-DD.'
      }),

    cep: z
      .string({
        invalid_type_error: 'O campo CEP ("cep") deve ser uma string.',
        required_error: 'O campo CEP ("cep") é obrigatório.'
      })
      .length(8, {
        message: 'O campo CEP ("cep") deve ter 8 caracteres.'
      }),

    clientId: z
      .string({
        invalid_type_error: 'O campo ID do Cliente ("clientId") deve ser uma string.',
        required_error: 'O campo ID do Cliente ("clientId") é obrigatório.'
      })
      .uuid({
        message: 'O campo ID do Cliente ("clientId") deve ser um UUID válido.'
      }),

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

    phoneNumber: z
      .string({
        invalid_type_error: 'O campo Telefone ("phoneNumber") deve ser uma string.',
        required_error: 'O campo Telefone ("phoneNumber") é obrigatório.'
      })
      .min(10, {
        message: 'O campo Telefone ("phoneNumber") deve ter pelo menos 10 caracteres.'
      }),

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
  })

  try {
    createOnePayloadSchema.parse({
      birthDate: req.body.birthDate,
      cep: req.body.cep,
      clientId: req.body.clientId,
      cpf: req.body.cpf,
      email: req.body.email,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      statusId: req.body.statusId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  const birthDateSplitted: string[] = req.body.birthDate.split('-')

  if (
    (birthDateSplitted.length !== 3) ||
    (birthDateSplitted[0].length !== 4) ||
    (birthDateSplitted[1].length !== 2) ||
    (birthDateSplitted[2].length !== 2) ||
    (birthDateSplitted.every((substring: any) => isNaN(Number(substring))))
  ) {
    throw new BadRequestError('"birthDate" deve estar no formato AAAA-MM-DD.')
  }

  next()
}

const validateCreateManyPayload = (req: Request, _res: Response, next: NextFunction): void => {
  const createManyPayloadSchema = z.object({
    clientId: z
      .string({
        invalid_type_error: 'O campo ID do Cliente ("clientId") deve ser uma string.',
        required_error: 'O campo ID do Cliente ("clientId") é obrigatório.'
      })
      .uuid({
        message: 'O campo ID do Cliente ("clientId") deve ser um UUID válido.'
      })
  })

  try {
    createManyPayloadSchema.parse({
      clientId: req.params.clientId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  next()
}

const validatefindManyQueryParams = (req: Request, _res: Response, next: NextFunction): void => {
  const findManyQueryParamsSchema = z.object({
    clientCnpj: z
      .string({
        invalid_type_error: 'O campo CNPJ do Cliente ("clientCnpj") deve ser uma string.',
        required_error: 'O campo CNPJ do Cliente ("clientCnpj") é obrigatório.'
      })
      .optional(),

    cpf: z
      .string({
        invalid_type_error: 'O campo CPF ("cpf") deve ser uma string.',
        required_error: 'O campo CPF ("cpf") é obrigatório.'
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
      }),

    name: z
      .string({
        invalid_type_error: 'O campo Nome ("name") deve ser uma string.',
        required_error: 'O campo Nome ("name") é obrigatório.'
      })
      .min(3, {
        message: 'O campo Nome ("name") deve ter pelo menos 3 caracteres.'
      })
      .optional(),

    skip: z
      .number({
        invalid_type_error: 'O campo Pular Registros ("skip") deve ser um number.',
        required_error: 'O campo Pular Registros ("skip") é obrigatório.'
      })
      .gte(0, {
        message: 'O campo Pular Registros ("skip") deve ser maior ou igual a 0.'
      }),

    statusId: z
      .number({
        invalid_type_error: 'O campo Status ("statusId") deve ser um number.',
        required_error: 'O campo Status ("statusId") é obrigatório.'
      })
      .gte(1, {
        message: 'O campo Status ("statusId") deve 1 (ativo), 2 (inativo), 3 (excluído) ou 4 (inadimplente).'
      })
      .lte(4, {
        message: 'O campo Status ("statusId") deve 1 (ativo), 2 (inativo), 3 (excluído) ou 4 (inadimplente).'
      })
      .optional()
  })

  try {
    findManyQueryParamsSchema.parse({
      clientCnpj: req.query['client-cnpj'],
      cpf: req.query.cpf,
      take: typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined,
      name: req.query.name,
      skip: typeof req.query.skip === 'string' ? parseInt(req.query.skip) : undefined,
      statusId: typeof req.query['status-id'] === 'string' ? parseInt(req.query['status-id']) : undefined
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  next()
}

const validateUpdateOnePayload = (req: Request, _res: Response, next: NextFunction): void => {
  const updateOnePayloadSchema = z.object({
    birthDate: z
      .string({
        invalid_type_error: 'O campo Data de Nascimento ("birthDate") deve ser uma string no formato AAAA-MM-DD.',
        required_error: 'O campo Data de Nascimento ("birthDate") é obrigatório e deve estar no formato AAAA-MM-DD.'
      })
      .optional(),

    cep: z
      .string({
        invalid_type_error: 'O campo CEP ("cep") deve ser uma string.',
        required_error: 'O campo CEP ("cep") é obrigatório.'
      })
      .length(8, {
        message: 'O campo CEP ("cep") deve ter 8 caracteres.'
      })
      .optional(),

    email: z
      .string({
        invalid_type_error: 'O campo E-mail ("email") deve ser uma string.',
        required_error: 'O campo E-mail ("email") é obrigatório.'
      })
      .email({
        message: 'O campo E-mail ("email") deve ser um e-mail válido.'
      })
      .optional(),

    name: z
      .string({
        invalid_type_error: 'O campo Nome ("name") deve ser uma string.',
        required_error: 'O campo Nome ("name") é obrigatório.'
      })
      .min(3, {
        message: 'O campo Nome ("name") deve ter pelo menos 3 caracteres.'
      })
      .optional(),

    phoneNumber: z
      .string({
        invalid_type_error: 'O campo Telefone ("phoneNumber") deve ser uma string.',
        required_error: 'O campo Telefone ("phoneNumber") é obrigatório.'
      })
      .min(10, {
        message: 'O campo Telefone ("phoneNumber") deve ter pelo menos 10 caracteres.'
      })
      .optional()
  })

  try {
    updateOnePayloadSchema.parse({
      birthDate: req.body.birthDate,
      cep: req.body.cep,
      email: req.body.email,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  if (req.body.birthDate !== undefined) {
    const birthDateSplitted: string[] = req.body.birthDate.split('-')

    if (
      (birthDateSplitted.length !== 3) ||
      (birthDateSplitted[0].length !== 4) ||
      (birthDateSplitted[1].length !== 2) ||
      (birthDateSplitted[2].length !== 2) ||
      (birthDateSplitted.every((substring: any) => isNaN(Number(substring))))
    ) {
      throw new BadRequestError('"birthDate" deve estar no formato AAAA-MM-DD.')
    }
  }

  next()
}

export default {
  validateCreateManyPayload,
  validateCreateOnePayload,
  validatefindManyQueryParams,
  validateUpdateOnePayload
}

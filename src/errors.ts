import { HttpStatusCode } from 'axios'

const DATABASE_ERROR = 'Falha em operação com banco de dados.'
const ENVIRONMENT_VARIABLE_ERROR = 'Variável de ambiente não encontrada:'
const FORBIDDEN_ERROR = 'Acesso negado. O usuário não possui permissão para acessar o recurso solicitado.'
const INTERNAL_SERVER_ERROR = 'Ocorreu um erro interno. Por favor, tente novamente e, caso o erro persista, entre em contato com nosso suporte.'

export class GenericError extends Error {
  public readonly error: unknown

  constructor (error: unknown, message?: string) {
    super(message)
    this.error = error
  }
}

export class DatabaseError extends Error {
  public readonly error: unknown

  constructor (error: unknown) {
    super(DATABASE_ERROR)
    this.error = error
  }
}

export class EnvironmentVariableError extends Error {
  constructor (missingEnvironmentVariable: string) {
    super(`${ENVIRONMENT_VARIABLE_ERROR} ${missingEnvironmentVariable}.`)
  }
}

export class BaseAPIError extends Error {
  public readonly statusCode: HttpStatusCode

  constructor (message: string, statusCode: HttpStatusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

export class BadRequestError extends BaseAPIError {
  constructor (message: string) {
    super(message, HttpStatusCode.BadRequest)
  }
}

export class UnauthorizedError extends BaseAPIError {
  constructor (message: string) {
    super(message, HttpStatusCode.Unauthorized)
  }
}

export class ForbiddenError extends BaseAPIError {
  constructor () {
    super(FORBIDDEN_ERROR, HttpStatusCode.Forbidden)
  }
}

export class NotFoundError extends BaseAPIError {
  constructor (message: string) {
    super(message, HttpStatusCode.NotFound)
  }
}

export class InternalServerError extends BaseAPIError {
  constructor (message?: string) {
    super(message ?? INTERNAL_SERVER_ERROR, HttpStatusCode.InternalServerError)
  }
}

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { HttpStatusCode } from 'axios'
import { type Request, type Response } from 'express'

import userServices from './services'
import type { FindManyUsersQueryParams, UserToBeCreated, UserToBeUpdated } from './interfaces'
import type { AccessTokenData } from '../../interfaces'

const createOne = async (req: Request, res: Response): Promise<Response> => {
  const USER_SUCCESSFULLY_CREATED = 'Usuário cadastrado com sucesso.'

  const userToBeCreated: UserToBeCreated = {
    clientId: req.body.clientId,
    cpf: req.body.cpf,
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    roleId: req.body.roleId
  }

  const userId = await userServices.createOne(userToBeCreated)

  return res.status(HttpStatusCode.Created).json({ message: USER_SUCCESSFULLY_CREATED, userId })
}

async function findOneById (req: Request, res: Response): Promise<Response> {
  const USER_FOUND = 'Usuário recuperado com sucesso.'

  const id = req.params.id

  const accessTokenData: AccessTokenData = {
    id: req.headers['request-user-id'] as string,
    clientId: req.headers['request-user-client-id'] as string,
    roleId: JSON.parse(req.headers['request-user-role-id'] as string)
  }

  const user = await userServices.findOneById(accessTokenData, id)

  return res.status(HttpStatusCode.Ok).json({ message: USER_FOUND, user })
}

async function findMany (req: Request, res: Response): Promise<Response> {
  const USERS_FOUND = 'Usuários recuperados com sucesso.'

  const queryParams: FindManyUsersQueryParams = {
    searchInput: req.query['search-input'] as string | undefined,
    skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
    statusId: req.query['status-id'] ? parseInt(req.query['status-id'] as string) : undefined,
    take: req.query.take ? parseInt(req.query.take as string) : undefined
  }

  const accessTokenData: AccessTokenData = {
    id: req.headers['request-user-id'] as string,
    clientId: req.headers['request-user-client-id'] as string,
    roleId: JSON.parse(req.headers['request-user-role-id'] as string)
  }

  const { items: users, totalCount } = await userServices.findMany(accessTokenData, queryParams)

  res.setHeader('x-total-count', totalCount.toString())

  return res.status(HttpStatusCode.Ok).json({ message: USERS_FOUND, users })
}

async function activateOne (req: Request, res: Response): Promise<Response> {
  const USER_SUCCESSFULLY_ACTIVATED = 'Usuário ativado com sucesso.'

  const userToBeActivatedId = req.params.id

  const userId = await userServices.activateOne(userToBeActivatedId)

  return res.status(HttpStatusCode.Ok).json({ message: USER_SUCCESSFULLY_ACTIVATED, userId })
}

async function inactivateOne (req: Request, res: Response): Promise<Response> {
  const USER_SUCCESSFULLY_INACTIVATED = 'Usuário inativado com sucesso.'

  const userToBeInactivatedId = req.params.id

  const userId = await userServices.inactivateOne(userToBeInactivatedId)

  return res.status(HttpStatusCode.Ok).json({ message: USER_SUCCESSFULLY_INACTIVATED, userId })
}

async function deleteOne (req: Request, res: Response): Promise<Response> {
  const USER_SUCCESSFULLY_DELETED = 'Usuário excluído com sucesso.'

  const userToBeDeletedId = req.params.id

  const userId = await userServices.deleteOne(userToBeDeletedId)

  return res.status(HttpStatusCode.Ok).json({ message: USER_SUCCESSFULLY_DELETED, userId })
}

async function updateOne (req: Request, res: Response): Promise<Response> {
  const USER_SUCCESSFULLY_UPDATED = 'Usuário atualizado com sucesso.'

  const userToBeUpdated: UserToBeUpdated = {
    clientId: req.body.clientId,
    email: req.body.email,
    name: req.body.name,
    roleId: req.body.roleId
  }

  const userToBeUpdatedId = req.params.id

  const userId = await userServices.updateOne(userToBeUpdatedId, userToBeUpdated)

  return res.status(HttpStatusCode.Ok).json({ message: USER_SUCCESSFULLY_UPDATED, userId })
}

export default {
  activateOne,
  createOne,
  deleteOne,
  findOneById,
  findMany,
  inactivateOne,
  updateOne
}

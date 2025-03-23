import { HttpStatusCode } from 'axios'
import { type Request, type Response } from 'express'

import { type MemberToBeUpdated, type FindManyMembersQueryParams, type MemberToBeCreated } from './interfaces'
import memberService from './services'
import { BadRequestError } from '../../errors'
import type { AccessTokenData } from '../../interfaces'
import type { Member } from '@prisma/client'

const createOne = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_SUCCESSFULLY_CREATED = 'Associado cadastrado com sucesso.'

  const memberToBeCreated: MemberToBeCreated = {
    birthDate: req.body.birthDate,
    cep: req.body.cep,
    clientId: req.body.clientId,
    cpf: req.body.cpf,
    email: req.body.email,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    statusId: req.body.statusId
  }

  const memberId = await memberService.createOne(memberToBeCreated)

  return res.status(HttpStatusCode.Created).json({ message: MEMBER_SUCCESSFULLY_CREATED, memberId })
}

const createMany = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_SUCCESSFULLY_CREATED = 'Associados cadastrados com sucesso.'
  const FILE_NOT_FOUND = 'O arquivo .csv não foi recebido.'

  const clientId: string = req.params.clientId
  const file = req.file?.buffer

  if (file === undefined) throw new BadRequestError(FILE_NOT_FOUND)

  await memberService.createMany(clientId, file)

  return res.status(HttpStatusCode.Created).json({ message: MEMBER_SUCCESSFULLY_CREATED })
}

const findMany = async (req: Request, res: Response): Promise<Response> => {
  const MEMBERS_FOUND = 'Associados recuperados com sucesso.'

  const queryParams: FindManyMembersQueryParams = {
    searchInput: req.query['search-input'] as string | undefined,
    take: parseInt(req.query.take as string),
    skip: parseInt(req.query.skip as string),
    statusId: req.query['status-id'] !== undefined ? parseInt(req.query['status-id'] as string) : undefined,
    orderBy: req.query['order-by'] as keyof Member | undefined
  }

  const accessTokenData: AccessTokenData = {
    id: req.headers['request-user-id'] as string,
    clientId: req.headers['request-user-client-id'] as string,
    roleId: JSON.parse(req.headers['request-user-role-id'] as string)
  }

  const { items: members, totalCount } = await memberService.findMany(accessTokenData, queryParams)

  res.setHeader('x-total-count', totalCount.toString())

  return res.status(HttpStatusCode.Ok).json({ message: MEMBERS_FOUND, members })
}

const findOneById = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_FOUND = 'Associado recuperado com sucesso.'

  const id = req.params.id

  const accessTokenData: AccessTokenData = {
    id: req.headers['request-user-id'] as string,
    clientId: req.headers['request-user-client-id'] as string,
    roleId: JSON.parse(req.headers['request-user-role-id'] as string)
  }

  const member = await memberService.findOneById(accessTokenData, id)

  return res.status(HttpStatusCode.Ok).json({ message: MEMBER_FOUND, member })
}

const activateOne = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_SUCCESSFULLY_ACTIVATED = 'Associado ativado com sucesso.'

  const memberId = req.params.id

  await memberService.activateOne(memberId)

  return res.status(HttpStatusCode.Ok).json({ message: MEMBER_SUCCESSFULLY_ACTIVATED })
}

const inactivateOne = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_SUCCESSFULLY_INACTIVATED = 'Associado inativado com sucesso.'

  const memberId = req.params.id

  await memberService.inactivateOne(memberId)

  return res.status(HttpStatusCode.Ok).json({ message: MEMBER_SUCCESSFULLY_INACTIVATED })
}

const deleteOne = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_SUCCESSFULLY_DELETED = 'Associado excluído com sucesso.'

  const memberId = req.params.id

  await memberService.deleteOne(memberId)

  return res.status(HttpStatusCode.Ok).json({ message: MEMBER_SUCCESSFULLY_DELETED })
}

const updateOne = async (req: Request, res: Response): Promise<Response> => {
  const MEMBER_SUCCESSFULLY_UPDATED = 'Associado atualizado com sucesso.'

  const memberId = req.params.id

  const memberToBeUpdated: Partial<MemberToBeUpdated> = {
    birthDate: req.body.birthDate,
    cep: req.body.cep,
    email: req.body.email,
    name: req.body.name,
    phoneNumber: req.body.phoneNumber
  }

  await memberService.updateOne(memberId, memberToBeUpdated)

  return res.status(HttpStatusCode.NoContent).json({ message: MEMBER_SUCCESSFULLY_UPDATED })
}

export default {
  activateOne,
  createMany,
  createOne,
  deleteOne,
  findMany,
  findOneById,
  inactivateOne,
  updateOne
}

import csv from 'csv-parser'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { BadRequestError, NotFoundError } from '../../errors'
import clientRepositories from '../client/repositories'
import { convertBufferToStream } from '../../utils/convertBufferToStream'
import {
  type MemberToBeReturnedOnFindMany,
  type FindManyMembersQueryParams,
  type FindManyMembersWhere,
  type MemberToBeCreated,
  type MemberToBeReturned,
  type MemberToBeUpdated
} from './interfaces'
import type { AccessTokenData, FindManyResponse } from '../../interfaces'
import memberRepositories from './repositories'
import { status } from '../../enums/statusEnum'
import { prismaError } from '../../enums/prismaError'
import { role } from '../../enums/roleEnum'
import type { Prisma } from '@prisma/client'

const createOne = async (memberToBeCreated: MemberToBeCreated): Promise<string> => {
  const INVALID_CLIENT = 'Cliente inválido.'

  const client = await clientRepositories.findOneById(memberToBeCreated.clientId, { statusId: status.ACTIVE })

  if (client === null) throw new BadRequestError(INVALID_CLIENT)

  const member = await memberRepositories.createOne(memberToBeCreated)

  return member.id
}

const createMany = async (clientId: string, fileBuffer: Buffer): Promise<void> => {
  const INVALID_CLIENT = 'Cliente inválido.'

  const client = await clientRepositories.findOneById(clientId, { statusId: status.ACTIVE })

  if (client === null) throw new BadRequestError(INVALID_CLIENT)

  const fileStream = convertBufferToStream(fileBuffer)

  fileStream
    .pipe(csv())
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .on('data', async (row) => {
      const memberToBeCreated: MemberToBeCreated = {
        birthDate: row.data_de_nascimento,
        cep: row.cep,
        clientId,
        cpf: row.cpf,
        email: row.email,
        name: row.nome,
        phoneNumber: row.telefone,
        statusId: status.ACTIVE
      }

      try {
        await memberRepositories.createOneForBulkCreation(memberToBeCreated)
      } catch (error) {
        if (
          (error instanceof PrismaClientKnownRequestError) &&
          (error.code === prismaError.ALREADY_EXITS)
        ) {
          logger.error(`O associado de CPF ${row.cpf} não foi cadastrado: esse CPF já existe no banco de dados.`)
        }
      }
    })
}

const findMany = async (
  accessTokenData: AccessTokenData,
  { skip, take, ...queryParams }: FindManyMembersQueryParams
): Promise<FindManyResponse<MemberToBeReturnedOnFindMany>> => {
  const MEMBERS_NOT_FOUND = 'Nenhum associado encontrado.'
  const CLIENT_NOT_FOUND = 'Cliente não encontrado.'

  const where: Partial<FindManyMembersWhere> = {}

  Object.entries(queryParams).forEach(([key, value]) => {
    if (
      value !== undefined &&
        value !== null &&
        key !== 'clientCnpj'
    ) {
      switch (key) {
        case 'cpf':
          Object.assign(where, { cpf: { contains: value } })
          break
        case 'name':
          Object.assign(where, { name: { contains: value } })
          break
        default:
          Object.assign(where, { [key]: value })
          break
      }
    }
  })

  if (accessTokenData.roleId === role.CLIENT_ADMIN) Object.assign(where, { clientId: accessTokenData.clientId })

  if (queryParams.clientCnpj !== undefined) {
    const client = await clientRepositories.findOneByCnpj(queryParams.clientCnpj)

    if (client === null) throw new BadRequestError(CLIENT_NOT_FOUND)

    Object.assign(where, { clientId: { contains: client.id } })
  }

  const members = await memberRepositories.findMany(skip, take, where)

  if (members.length === 0) throw new NotFoundError(MEMBERS_NOT_FOUND)

  const totalCount = await memberRepositories.count(where)

  return { items: members, totalCount }
}

const findOneById = async (
  accessTokenData: AccessTokenData,
  id: string
): Promise<MemberToBeReturned> => {
  const MEMBER_NOT_FOUND = 'Associado não encontrado.'

  const where: Prisma.MemberWhereInput = {}

  // Se for usuário de cliente, filtra associados pelo clientId
  if (accessTokenData.roleId === role.CLIENT_ADMIN) Object.assign(where, { clientId: accessTokenData.clientId })

  const member = await memberRepositories.findOneById(id, where)

  if (member === null) throw new NotFoundError(MEMBER_NOT_FOUND)

  const { password, createdPassword, updatedAt, ...memberToBeReturned } = member

  if (accessTokenData.roleId === role.CLIENT_ADMIN) {
    memberToBeReturned.orders = memberToBeReturned.orders.map(({ items, ...order }) => ({ items: [], ...order }))
  }

  return memberToBeReturned
}

const activateOne = async (id: string): Promise<void> => {
  await memberRepositories.updateOne(id, { statusId: 1 })
}

const inactivateOne = async (id: string): Promise<void> => {
  await memberRepositories.updateOne(id, { statusId: 2 })
}

const deleteOne = async (id: string): Promise<void> => {
  await memberRepositories.updateOne(id, { statusId: 3 })
}

const updateOne = async (id: string, memberToBeUpdated: Partial<MemberToBeUpdated>): Promise<void> => {
  await memberRepositories.updateOne(id, memberToBeUpdated)
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

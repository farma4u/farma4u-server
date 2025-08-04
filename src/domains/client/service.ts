import type { Prisma } from '@prisma/client'

import clientRepositories from './repositories'
import type {
  ClientToBeUpdated,
  ClientToBeCreated,
  ClientToBeReturned,
  FindManyClientsQueryParams,
  FindManyClientsOrderBy
} from './interfaces'
import memberRepositories from '../member/repositories'
import { NotFoundError } from '../../errors'
import type { FindManyResponse } from '../../interfaces'

const createOne = async (clientToBeCreated: ClientToBeCreated): Promise<string> => {
  const { id } = await clientRepositories.createOne(clientToBeCreated)

  return id
}

async function findMany (
  { skip, take, orderBy, ...queryParams }: FindManyClientsQueryParams
): Promise<FindManyResponse<ClientToBeReturned>> {
  const CLIENTS_NOT_FOUND = 'Nenhum cliente encontrado.'

  const where: Prisma.ClientWhereInput = { OR: [] }

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      switch (key) {
        case 'searchInput':
          where.OR?.push({ cnpj: { contains: value as string } })
          where.OR?.push({ fantasyName: { contains: value as string } })
          where.OR?.push({ corporateName: { contains: value as string } })
          break
        default:
          Object.assign(where, { [key]: value })
          break
      }
    }
  })

  if (where.OR?.length === 0) delete where.OR

  let orderByQuery: FindManyClientsOrderBy

  switch (true) {
    case (orderBy === 'membersCount'):
      orderByQuery = { members: { _count: 'desc' } }
      break
    case (orderBy !== undefined && orderBy !== ''):
      orderByQuery = { [orderBy]: 'desc' }
      break
    default:
      orderByQuery = { totalSavings: 'desc' }
      break
  }

  const clients = await clientRepositories.findMany({ where, skip, take, orderByQuery })

  if (clients.length === 0) throw new NotFoundError(CLIENTS_NOT_FOUND)

  const totalCount = await clientRepositories.count(where)

  return { items: clients, totalCount }
}

const findOneById = async (id: string): Promise<ClientToBeReturned> => {
  const CLIENT_NOT_FOUND = 'Cliente não encontrado.'

  const client = await clientRepositories.findOneById(id)

  if (client === null) throw new NotFoundError(CLIENT_NOT_FOUND)

  const { updatedAt, ...clientToBeReturned } = client

  return clientToBeReturned
}

const activateOne = async (id: string): Promise<void> => {
  await clientRepositories.updateOne(id, { statusId: 1 })
  await memberRepositories.updateMany({ statusId: 1 }, { clientId: id })
}

const inactivateOne = async (id: string): Promise<void> => {
  await clientRepositories.updateOne(id, { statusId: 2 })
  await memberRepositories.updateMany({ statusId: 2 }, { clientId: id })
}

const setOneAsDefaulting = async (id: string): Promise<void> => {
  await clientRepositories.updateOne(id, { statusId: 4 })
  await memberRepositories.updateMany({ statusId: 4 }, { clientId: id })
}

const deleteOne = async (id: string): Promise<void> => {
  await clientRepositories.updateOne(id, { statusId: 3 })
  await memberRepositories.updateMany({ statusId: 3 }, { clientId: id })
}

const updateOne = async (id: string, clientToBeUpdated: Partial<ClientToBeUpdated>): Promise<void> => {
  await clientRepositories.updateOne(id, clientToBeUpdated)
}

export default {
  activateOne,
  createOne,
  deleteOne,
  findMany,
  findOneById,
  inactivateOne,
  setOneAsDefaulting,
  updateOne
}

import clientRepositories from './repositories'
import type {
  ClientToBeUpdated,
  ClientToBeCreated,
  ClientToBeReturned,
  FindManyClientsQueryParams,
  FindManyClientsWhere
} from './interfaces'
import memberRepositories from '../member/repositories'
import { NotFoundError } from '../../errors'
import { type FindManyResponse } from '../../interfaces'

const createOne = async (clientToBeCreated: ClientToBeCreated): Promise<string> => {
  const { id } = await clientRepositories.createOne(clientToBeCreated)

  return id
}

const findMany = async ({ skip, take, ...queryParams }: FindManyClientsQueryParams): Promise<FindManyResponse<ClientToBeReturned> & { systemTotalSavings: number }> => {
  const CLIENTS_NOT_FOUND = 'Nenhum cliente encontrado.'

  const where: FindManyClientsWhere = {}

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      switch (key) {
        case 'cnpj':
          Object.assign(where, { cnpj: { contains: value } })
          break
        case 'fantasyName':
          Object.assign(where, { fantasyName: { contains: value } })
          break
        default:
          Object.assign(where, { [key]: value })
          break
      }
    }
  })

  const clients = await clientRepositories.findMany(where, skip, take)

  if (clients.length === 0) throw new NotFoundError(CLIENTS_NOT_FOUND)

  const totalCount = await clientRepositories.count(where)
  // const systemTotalSavings = await clientRepositories.sumSystemSavings()

  return { items: clients, totalCount, systemTotalSavings: 0 }
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

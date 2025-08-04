import { type Prisma, type Client } from '@prisma/client'

export type ClientToBeCreated = Omit<Client, 'id' | 'totalSavings' | 'createdAt' | 'updatedAt'>

export type ClientToBeReturned = Omit<Client, 'updatedAt'>

export type ClientToBeUpdated = Omit<ClientToBeCreated, 'cnpj' | 'statusId'>
export interface FindManyClientsQueryParams {
  cnpj?: string
  take?: number
  fantasyName?: string
  skip?: number
  statusId?: number | typeof NaN
}

export type FindManyClientsWhere = Pick<Prisma.ClientWhereInput, 'cnpj' | 'fantasyName' | 'statusId'>

export type CountClientsWhere = Pick<Prisma.ClientWhereInput, 'id' | 'statusId'>

export type ClientMinData = Pick<Client, 'id' | 'fantasyName'>

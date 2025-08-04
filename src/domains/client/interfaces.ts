import type { Prisma, Client } from '@prisma/client'

export type ClientToBeCreated = Omit<Client, 'id' | 'totalSavings' | 'createdAt' | 'updatedAt'>

export type ClientToBeReturned = Omit<Client, 'updatedAt'>

export type ClientToBeUpdated = Omit<ClientToBeCreated, 'cnpj' | 'statusId'>
export interface FindManyClientsQueryParams {
  orderBy?: keyof Client | 'membersCount' | ''
  searchInput?: string
  skip?: number
  statusId?: number | typeof NaN
  take?: number
}

export type FindManyClientsOrderBy = Partial<Record<keyof Client, 'desc'>> | { members: { _count: 'desc' } }

export interface FindManyClientsParams {
  orderByQuery: FindManyClientsOrderBy
  skip?: number
  take?: number
  where: Partial<Prisma.ClientWhereInput>
}

export type CountClientsWhere = Pick<Prisma.ClientWhereInput, 'id' | 'statusId'>

export type ClientMinData = Pick<Client, 'id' | 'fantasyName'>

import { type Prisma, type Item, type Member, type Order } from '@prisma/client'

export interface FindManyMembersQueryParams {
  clientCnpj?: string
  cpf?: string
  take: number
  name?: string
  skip: number
  statusId?: number | typeof NaN
}

export type FindManyMembersWhere = Pick<Prisma.MemberWhereInput, 'cpf' | 'clientId' | 'name' | 'statusId'>

export type MemberToBeCreated = Omit<Member, 'id' | 'password' | 'createdPassword' | 'totalSavings' | 'createdAt' | 'updatedAt' | 'isHinova'>

export type MemberToBeUpdated = Omit<MemberToBeCreated, 'cpf' | 'statusId'>

export type MemberToBeReturned = Omit<Member, 'password' | 'createdPassword' | 'updatedAt'> & { orders: Array<Order & { items: Item[] }> }

export type MemberToBeReturnedOnFindMany = Omit<MemberToBeReturned, 'orders' | 'clientId' | 'isHinova'> & { client: { cnpj: string, fantasyName: string } }

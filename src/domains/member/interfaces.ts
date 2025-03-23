import { type Prisma, type Item, type Member, type Order } from '@prisma/client'
import type { ClientMinData } from '../client/interfaces'

export interface FindManyMembersQueryParams {
  searchInput?: string
  take: number
  skip: number
  statusId?: number | typeof NaN
  orderBy?: keyof Member
}

export type FindManyMembersOrderBy = Partial<Record<keyof Member, 'desc'>>

export type FindManyMembersWhere = Pick<Prisma.MemberWhereInput, 'cpf' | 'clientId' | 'name' | 'statusId'>

export type MemberToBeCreated = Omit<Member, 'id' | 'password' | 'createdPassword' | 'totalSavings' | 'createdAt' | 'updatedAt' | 'isHinova'>

export type MemberToBeUpdated = Omit<MemberToBeCreated, 'cpf' | 'statusId'>

export type MemberToBeReturned = Omit<Member, 'password' | 'createdPassword' | 'updatedAt'> & { orders: Array<Order & { items: Item[] }> }

export type MemberToBeReturnedOnFindMany = Omit<MemberToBeReturned, 'orders' | 'clientId' | 'isHinova'> & { client: { cnpj: string, fantasyName: string } }

export type MemberWithClientData = Member & { client: ClientMinData | null }

export type MemberLoginInfo = Pick<MemberWithClientData, 'id' | 'name' | 'client'> & { roleId: number }

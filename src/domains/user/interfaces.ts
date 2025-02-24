import type { Client, Prisma, User } from '@prisma/client'
import type { ClientMinData } from '../client/interfaces'
import type { RoleMinData } from '../role/roleInterfaces'
import type { StatusToBeReturned } from '../status/statusInterfaces'

export type UserToBeCreated = Pick<User, 'cpf' | 'name' | 'email' | 'password' | 'roleId' | 'clientId'>

export type UserCreated = Pick<User, 'id' | 'name'>

export type UserLoggedIn = Pick<User, 'id' | 'name' | 'password' | 'roleId'>

export interface ICreateOneResponse {
  user: UserCreated
  accessToken: string
}

export type UserToBeReturned = Omit<User, 'clientId' | 'roleId' | 'statusId'> & { client: ClientMinData | null } & { role: RoleMinData } & { status: StatusToBeReturned }

export type UserToBeReturnedInFindMany = Omit<UserToBeReturned, 'updatedAt' | 'email' | 'password'>

export type UserWithClientData = User & { client: ClientMinData | null }

export type UserLoginInfo = Pick<UserWithClientData, 'id' | 'name' | 'roleId' | 'client'>

export interface FindManyUsersQueryParams {
  searchInput?: string
  skip?: number
  statusId?: number | typeof NaN
  take?: number
}

export interface FindManyUsersParams {
  skip?: number
  take?: number
  where: Partial<Prisma.UserWhereInput>
}

export type UserToBeUpdated = Omit<UserToBeCreated, 'cpf' | 'password'>

export interface SystemData { totalSavings: Client['totalSavings'], totalOrderCount: number }

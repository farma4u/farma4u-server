import { type User } from '@prisma/client'
import type { ClientMinData } from '../client/interfaces'
import type { RoleMinData } from '../role/roleInterfaces'
import type { StatusToBeReturned } from '../status/statusInterfaces'
import type { UserLoginInfo } from '../user/interfaces'
import type { MemberLoginInfo } from '../member/interfaces'

export interface IUserLoginResponse {
  accessToken: string
  user: UserLoginInfo
}

export interface IMemberLoginResponse {
  accessToken: string
  user: MemberLoginInfo
}

export type UserToBeReturned = Omit<User, 'clientId' | 'roleId' | 'statusId'> & { client: ClientMinData | null } & { role: RoleMinData } & { status: StatusToBeReturned }

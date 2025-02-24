import bcrypt from 'bcrypt'

import type {
  FindManyUsersQueryParams,
  UserToBeReturnedInFindMany,
  UserToBeCreated,
  UserToBeUpdated,
  SystemData
} from './interfaces'
import clientRepositories from '../client/repositories'
import orderRepositories from '../order/repositories'
import userRepositories from './repositories'
import { NotFoundError } from '../../errors'
import { role } from '../../enums/roleEnum'
import type { Prisma } from '@prisma/client'
import type { UserToBeReturned } from '../auth/interfaces'
import type { AccessTokenData, FindManyResponse } from '../../interfaces'
import { status } from '../../enums/statusEnum'

const createOne = async (userToBeCreated: UserToBeCreated): Promise<string> => {
  const encryptedPassword = await bcrypt.hash(userToBeCreated.password, 10)

  userToBeCreated.password = encryptedPassword

  const user = await userRepositories.createOne(userToBeCreated)

  return user.id
}

async function findOneById (accessTokenData: AccessTokenData, id: string): Promise<Omit<UserToBeReturned, 'password'>> {
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  const where: Prisma.UserWhereInput = {}

  if (accessTokenData.roleId === role.CLIENT_ADMIN) Object.assign(where, { clientId: accessTokenData.clientId })

  const user = await userRepositories.findOne({ id }, where)

  if (user === null) throw new NotFoundError(USER_NOT_FOUND)

  const { password, ...userWithoutPassword } = user

  return userWithoutPassword
}

async function findMany (
  accessTokenData: AccessTokenData,
  { skip, take, ...queryParams }: FindManyUsersQueryParams
): Promise<FindManyResponse<UserToBeReturnedInFindMany>> {
  const USERS_NOT_FOUND = 'Nenhum usuário encontrado.'

  const where: Prisma.UserWhereInput = { OR: [] }

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      switch (key) {
        case 'searchInput':
          where.OR?.push({ cpf: { contains: value as string } })
          where.OR?.push({ name: { contains: value as string } })
          break
        default:
          Object.assign(where, { [key]: value })
          break
      }
    }
  })

  if (accessTokenData.roleId === role.CLIENT_ADMIN) Object.assign(where, { clientId: accessTokenData.clientId })

  if (where.OR?.length === 0) delete where.OR

  const users = await userRepositories.findMany({ skip, take, where })

  if (users.length === 0) throw new NotFoundError(USERS_NOT_FOUND)

  const totalCount = await userRepositories.count(where)

  return { items: users, totalCount }
}

async function activateOne (userToBeActivatedId: string): Promise<string> {
  const userId = await userRepositories.updateOne(userToBeActivatedId, { statusId: status.ACTIVE })

  return userId
}

async function inactivateOne (userToBeInactivatedId: string): Promise<string> {
  const userId = await userRepositories.updateOne(userToBeInactivatedId, { statusId: status.INACTIVE })

  return userId
}

async function deleteOne (userToBeDeletedId: string): Promise<string> {
  const user = await userRepositories.findOne({ id: userToBeDeletedId })

  if (user === null) throw new NotFoundError('Usuário não encontrado.')

  const userId = await userRepositories.updateOne(userToBeDeletedId, { cpf: `${user.cpf}_EXCLUIDO`, statusId: status.DELETED })

  return userId
}

async function updateOne (userToBeUpdatedId: string, userToBeUpdated: UserToBeUpdated): Promise<string> {
  const userId = await userRepositories.updateOne(userToBeUpdatedId, userToBeUpdated)

  return userId
}

const getSystemData = async (requestUserRoleId: role, requestUserClientId: string | null): Promise<SystemData> => {
  const clientWhere: Prisma.ClientWhereInput = {}
  const orderWhere: Prisma.OrderWhereInput = {}

  if (requestUserRoleId === role.CLIENT_ADMIN) {
    Object.assign(clientWhere, { id: requestUserClientId })
    Object.assign(orderWhere, { clientId: requestUserClientId })
  }

  const totalSavings = await clientRepositories.sumSystemSavings(clientWhere)
  const totalOrderCount = await orderRepositories.count(orderWhere)

  return { totalSavings: totalSavings ?? 0, totalOrderCount }
}

export default {
  activateOne,
  createOne,
  deleteOne,
  findOneById,
  findMany,
  getSystemData,
  inactivateOne,
  updateOne
}

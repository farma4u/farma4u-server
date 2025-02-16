import prismaClient from '../../database/connection'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { Prisma, User } from '@prisma/client'

import { BadRequestError, DatabaseError, NotFoundError } from '../../errors'
import { status } from '../../enums/statusEnum'
import type { FindManyUsersParams, UserToBeCreated, UserToBeReturnedInFindMany } from './interfaces'
import type { UserToBeReturned } from '../auth/interfaces'
import { prismaError } from '../../enums/prismaErrors'

const createOne = async (userToBeCreated: UserToBeCreated): Promise<Pick<User, 'id'>> => {
  try {
    const user = await prismaClient.user.create({
      data: { ...userToBeCreated, statusId: status.ACTIVE },
      select: {
        id: true
      }
    })

    return user
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.ALREADY_EXITS)
    ) throw new BadRequestError('CPF ou e-mail já cadastrado.')

    throw new DatabaseError(error)
  }
}

async function findOne (uniqueProps: Prisma.UserWhereUniqueInput, optionalFilter?: Prisma.UserWhereInput): Promise<UserToBeReturned | null> {
  try {
    const where = { ...uniqueProps }

    if (optionalFilter !== undefined) Object.assign(where, optionalFilter)

    const user = await prismaClient.user.findUnique({
      where,
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        status: {
          select: {
            id: true,
            translation: true
          }
        },
        role: {
          select: {
            id: true,
            translation: true
          }
        },
        client: {
          select: {
            id: true,
            fantasyName: true
          }
        }
      }
    })

    return user ?? null
  } catch (error) {
    throw new DatabaseError(error)
  }
}

async function findMany ({ skip, take, where }: FindManyUsersParams): Promise<UserToBeReturnedInFindMany[]> {
  try {
    const users = await prismaClient.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        cpf: true,
        name: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            fantasyName: true
          }
        },
        role: {
          select: {
            id: true,
            translation: true
          }
        },
        status: {
          select: {
            id: true,
            translation: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return users
  } catch (error) {
    throw new DatabaseError(error)
  }
}

async function count (where: Prisma.UserWhereInput): Promise<number> {
  try {
    const count = await prismaClient.user.count({ where })

    return count
  } catch (error) {
    throw new DatabaseError(error)
  }
}

async function updateOne (id: string, data: Partial<User>): Promise<string> {
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  try {
    const { id: userId } = await prismaClient.user.update({
      data,
      where: { id },
      select: { id: true }
    })

    return userId
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(USER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

export default {
  createOne,
  count,
  findOne,
  findMany,
  updateOne
}

import { type Item, type Member, type MemberFirstAcessCode, type Order, type Prisma } from '@prisma/client'
import prismaClient from '../../database/connection'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { BadRequestError, DatabaseError, NotFoundError } from '../../errors'
import type {
  MemberToBeReturnedOnFindMany,
  FindManyMembersWhere,
  MemberToBeCreated,
  MemberWithClientData
} from './interfaces'
import { prismaError } from '../../enums/prismaError'
import { status } from '../../enums/statusEnum'

const MEMBER_NOT_FOUND = 'Associado não encontrado.'

const count = async (where: Prisma.MemberWhereInput): Promise<number> => {
  try {
    const count = await prismaClient.member.count({ where })

    return count
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const createOne = async (memberToBeCreated: MemberToBeCreated): Promise<Pick<Member, 'id'>> => {
  const MEMBER_ALREADY_EXISTS = 'CPF ou e-mail já cadastrado.'
  try {
    const member = await prismaClient.member.create({
      data: { ...memberToBeCreated },
      select: {
        id: true
      }
    })

    return member
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.ALREADY_EXITS)
    ) throw new BadRequestError(MEMBER_ALREADY_EXISTS)

    throw new DatabaseError(error)
  }
}

const createOneForBulkCreation = async (memberToBeCreated: MemberToBeCreated): Promise<Pick<Member, 'id'>> => {
  const member = await prismaClient.member.create({
    data: { ...memberToBeCreated },
    select: {
      id: true
    }
  })

  return member
}

const findMany = async (
  skip: number,
  take: number,
  where: Partial<FindManyMembersWhere>
): Promise<MemberToBeReturnedOnFindMany[]> => {
  try {
    const members = await prismaClient.member.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        client: {
          select: {
            cnpj: true,
            fantasyName: true
          }
        },
        name: true,
        cpf: true,
        email: true,
        birthDate: true,
        phoneNumber: true,
        cep: true,
        totalSavings: true,
        statusId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return members
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const findOneByCpf = async (cpf: string): Promise<MemberWithClientData | null> => {
  try {
    const member = await prismaClient.member.findUnique({
      where: { cpf, statusId: status.ACTIVE },
      include: {
        client: {
          select: {
            id: true,
            fantasyName: true
          }
        }
      }
    })

    return member
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const findOneById = async (
  id: string,
  data?: Prisma.MemberWhereInput
): Promise<Member & {
  orders: Array<Order & { items: Item[] }>
  client: { id: string, cnpj: string, fantasyName: string }
} | null> => {
  try {
    const where = { id }

    if (data !== undefined) Object.assign(where, data)

    const member = await prismaClient.member.findUnique({
      where,
      include: {
        client: {
          select: {
            id: true,
            cnpj: true,
            fantasyName: true
          }
        },
        orders: {
          include: {
            items: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return member
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const updateMany = async (
  data: Partial<Member>,
  where: Prisma.MemberWhereInput
): Promise<void> => {
  try {
    await prismaClient.member.updateMany({
      data,
      where
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(`${MEMBER_NOT_FOUND}${data.id !== null ? ' (id: ' + data.id + ')' : ''}`)

    throw new DatabaseError(error)
  }
}

const updateOne = async (id: string, data: Partial<Member>): Promise<void> => {
  try {
    await prismaClient.member.update({
      data,
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(MEMBER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

const addToSavings = async (id: string, savingsToAdd: number): Promise<void> => {
  try {
    await prismaClient.member.update({
      data: { totalSavings: { increment: savingsToAdd } },
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(MEMBER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

const subtractFromSavings = async (id: string, savingsToSubtract: number): Promise<void> => {
  try {
    await prismaClient.member.update({
      data: { totalSavings: { decrement: savingsToSubtract } },
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(MEMBER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

const findOneFirstAccessCode = async (memberId: string): Promise<MemberFirstAcessCode | null> => {
  try {
    const firstAccessCodeData = await prismaClient.memberFirstAcessCode.findUnique({
      where: { memberId }
    })

    return firstAccessCodeData
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const upsertOneFirstAccessCode = async (memberId: string, firstAccessCode: string): Promise<void> => {
  try {
    await prismaClient.memberFirstAcessCode.upsert({
      create: { memberId, firstAccessCode },
      update: { firstAccessCode },
      where: { memberId }
    })
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const deleteOneFirstAccessCode = async (memberId: string): Promise<void> => {
  try {
    await prismaClient.memberFirstAcessCode.delete({
      where: { memberId }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(MEMBER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

export default {
  addToSavings,
  count,
  createOne,
  createOneForBulkCreation,
  deleteOneFirstAccessCode,
  findMany,
  findOneByCpf,
  findOneById,
  findOneFirstAccessCode,
  subtractFromSavings,
  updateMany,
  updateOne,
  upsertOneFirstAccessCode
}

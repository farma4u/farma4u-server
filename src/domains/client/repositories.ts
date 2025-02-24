import { type Client, type Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { BadRequestError, DatabaseError, NotFoundError } from '../../errors'
import { type ClientToBeCreated, type ClientToBeReturned, type FindManyClientsWhere } from './interfaces'
import prismaClient from '../../database/connection'
import { prismaError } from '../../enums/prismaError'
import { status } from '../../enums/statusEnum'

const count = async (where: Prisma.ClientWhereInput): Promise<number> => {
  try {
    const count = await prismaClient.client.count({ where })

    return count
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const sumSystemSavings = async (where?: Prisma.ClientWhereInput): Promise<number | null> => {
  try {
    const { _sum: { totalSavings: systemTotalSavings } } = await prismaClient.client.aggregate({
      _sum: { totalSavings: true },
      where
    })

    return systemTotalSavings
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const createOne = async (clientToBeCreated: ClientToBeCreated): Promise<Pick<Client, 'id'>> => {
  const CLIENT_ALREADY_EXISTS = 'CNPJ já cadastrado.'

  try {
    const client = await prismaClient.client.create({
      data: { ...clientToBeCreated },
      select: {
        id: true
      }
    })

    return client
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.ALREADY_EXITS)
    ) throw new BadRequestError(CLIENT_ALREADY_EXISTS)

    throw new DatabaseError(error)
  }
}

const findMany = async (
  where: Partial<FindManyClientsWhere>,
  skip?: number,
  take?: number
): Promise<ClientToBeReturned[]> => {
  try {
    const clients = await prismaClient.client.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        cnpj: true,
        corporateName: true,
        fantasyName: true,
        segment: true,
        address: true,
        state: true,
        city: true,
        managerName: true,
        managerPhoneNumber: true,
        managerEmail: true,
        financePhoneNumber: true,
        lumpSum: true,
        unitValue: true,
        totalSavings: true,
        contractUrl: true,
        isHinova: true,
        hinovaToken: true,
        statusId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return clients
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const findOneByCnpj = async (cnpj: string): Promise<Client | null> => {
  try {
    const client = await prismaClient.client.findUnique({
      where: { cnpj, statusId: status.ACTIVE }
    })

    return client
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const findOneById = async (id: string, data?: Partial<Client>): Promise<Client | null> => {
  try {
    const where = { id }

    if (data !== undefined) Object.assign(where, data)

    const client = await prismaClient.client.findUnique({
      where
    })

    return client
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const updateOne = async (id: string, data: Partial<Client>): Promise<void> => {
  const CLIENT_NOT_FOUND = 'Cliente não encontrado.'

  try {
    await prismaClient.client.update({
      data,
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(CLIENT_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

const addToSavings = async (id: string, savingsToAdd: number): Promise<void> => {
  const CLIENT_NOT_FOUND = 'Cliente não encontrado.'

  try {
    await prismaClient.client.update({
      data: { totalSavings: { increment: savingsToAdd } },
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(CLIENT_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

const subtractFromSavings = async (id: string, savingsToSubtract: number): Promise<void> => {
  const CLIENT_NOT_FOUND = 'Cliente não encontrado.'

  try {
    await prismaClient.client.update({
      data: { totalSavings: { decrement: savingsToSubtract } },
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(CLIENT_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

export default {
  addToSavings,
  count,
  createOne,
  findMany,
  findOneByCnpj,
  findOneById,
  subtractFromSavings,
  sumSystemSavings,
  updateOne
}

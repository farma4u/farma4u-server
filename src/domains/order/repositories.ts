import { type Order, type Prisma } from '@prisma/client'

import { BadRequestError, DatabaseError, NotFoundError } from '../../errors'
import { type ItemToBeCreated, type OrderToBeCreated } from './interfaces'
import prismaClient from '../../database/connection'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { prismaError } from '../../enums/prismaError'

const createOne = async ({ items, ...orderToBeCreated }: OrderToBeCreated & { clientId: string }): Promise<Pick<Order, 'id'>> => {
  const ORDER_ALREADY_EXISTS = 'Pedido já cadastrado.'

  try {
    const order = await prismaClient.order.create({
      data: { ...orderToBeCreated },
      select: {
        id: true
      }
    })

    return order
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.ALREADY_EXITS)
    ) throw new BadRequestError(ORDER_ALREADY_EXISTS)

    throw new DatabaseError(error)
  }
}

const createManyItems = async (orderId: string, items: ItemToBeCreated[]): Promise<void> => {
  const ITEM_ALREADY_EXISTS = 'Item do pedido já cadastrado.'

  try {
    await prismaClient.item.createMany({
      data: items.map((item) => ({ ...item, orderId }))
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.ALREADY_EXITS)
    ) throw new BadRequestError(ITEM_ALREADY_EXISTS)

    throw new DatabaseError(error)
  }
}

const findAnyById = async (id: string, select?: Partial<Prisma.OrderSelect>): Promise<Partial<Order> | null> => {
  try {
    const order = await prismaClient.order.findUnique({
      where: { id },
      select
    })

    return order
  } catch (error) {
    throw new DatabaseError(error)
  }
}

const updateOne = async (id: string, data: Partial<Order>): Promise<Order> => {
  const ORDER_NOT_FOUND = 'Pedido não encontrado.'

  try {
    const order = await prismaClient.order.update({
      data,
      where: { id }
    })

    return order
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) throw new NotFoundError(ORDER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

export default {
  createManyItems,
  createOne,
  findAnyById,
  updateOne
}

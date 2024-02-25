import { Order } from '@prisma/client'
import { OrderToBeCreated } from './interfaces'
import prismaClient from '../../database/connection'
import { BadRequestError, DatabaseError, NotFoundError } from '../../errors'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { prismaErrors } from '../../enums/prismaErrors'

const createOne = async (orderToBeCreated: OrderToBeCreated): Promise<Pick<Order, 'id'>> => {
  const ORDER_ALREADY_EXISTS = 'Pedido já cadastrado.'
  try {
    const order = await prismaClient.order.create({
      data: { ...orderToBeCreated },
      select: {
        id: true,
      }
    })
  
    return order
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaErrors.ALREADY_EXITS)
    ) throw new BadRequestError(ORDER_ALREADY_EXISTS)

    throw new DatabaseError(error)
  }
}

const updateOne = async (id: string, data: Partial<Order>): Promise<void> => {
  const ORDER_NOT_FOUND = 'Pedido não encontrado.'
  
  try {
    await prismaClient.order.update({
      data,
      where: { id }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaErrors.NOT_FOUND)
    ) throw new NotFoundError(ORDER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}

export default { createOne, updateOne }

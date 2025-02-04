import { HttpStatusCode } from 'axios'
import { type Request, type Response } from 'express'

import orderService from './services'
import { type OrderToBeCreated } from './interfaces'

const createOne = async (req: Request, res: Response): Promise<Response> => {
  const ORDER_SUCCESSFULLY_CREATED = 'Pedido cadastrado com sucesso.'

  const orderToBeCreated: OrderToBeCreated = {
    memberId: req.body.memberId,
    totalValue: req.body.totalValue,
    totalSavings: req.body.totalSavings,
    notes: req.body.notes,
    isRecurring: req.body.isRecurring,
    statusId: req.body.statusId,
    items: req.body.items
  }

  const orderId = await orderService.createOne(orderToBeCreated)

  return res.status(HttpStatusCode.Created).json({ message: ORDER_SUCCESSFULLY_CREATED, orderId })
}

const activateOne = async (req: Request, res: Response): Promise<Response> => {
  const ORDER_SUCCESSFULLY_ACTIVATED = 'Pedido ativado com sucesso.'

  const orderId = req.params.id

  await orderService.activateOne(orderId)

  return res.status(HttpStatusCode.Ok).json({ message: ORDER_SUCCESSFULLY_ACTIVATED })
}

const inactivateOne = async (req: Request, res: Response): Promise<Response> => {
  const ORDER_SUCCESSFULLY_INACTIVATED = 'Pedido inativado com sucesso.'

  const orderId = req.params.id

  await orderService.inactivateOne(orderId)

  return res.status(HttpStatusCode.Ok).json({ message: ORDER_SUCCESSFULLY_INACTIVATED })
}

const deleteOne = async (req: Request, res: Response): Promise<Response> => {
  const ORDER_SUCCESSFULLY_DELETED = 'Pedido excluído com sucesso.'

  const orderId = req.params.id

  await orderService.deleteOne(orderId)

  return res.status(HttpStatusCode.Ok).json({ message: ORDER_SUCCESSFULLY_DELETED })
}

// const updateOne = async (req: Request, res: Response): Promise<Response> => {
//   const ORDER_SUCCESSFULLY_UPDATED = 'Pedido atualizado com sucesso.'

//   const orderId = req.params.id

//   const orderToBeCreated: OrderToBeCreated = {
//     memberId: req.body.memberId,
//     totalValue: req.body.totalValue,
//     totalSavings: req.body.totalSavings,
//     notes: req.body.notes,
//     isRecurring: req.body.isRecurring,
//     statusId: req.body.statusId,
//     items: req.body.items
//   }

//   await orderService.updateOne(orderId)

//   return res.status(HttpStatusCode.NoContent).json({ message: ORDER_SUCCESSFULLY_UPDATED })
// }

export default {
  activateOne,
  createOne,
  deleteOne,
  inactivateOne
  // updateOne
}

import { type NextFunction, type Request, type Response } from 'express'
import { z } from 'zod'
import { BadRequestError, GenericError } from '../../errors'
import { type ItemToBeCreated } from './interfaces'

const validateCreateOnePayload = (req: Request, _res: Response, next: NextFunction): void => {
  const createOneOrderPayloadSchema = z.object({
    memberId: z
      .string({
        invalid_type_error: 'O campo ID do Associado ("memberId") deve ser uma string.',
        required_error: 'O campo ID do Associado ("memberId") é obrigatório.'
      })
      .uuid({
        message: 'O campo ID do Associado ("memberId") deve ser um UUID válido.'
      }),

    totalValue: z
      .number({
        invalid_type_error: 'O campo Valor Total ("totalValue") deve ser um number.',
        required_error: 'O campo Valor Total ("totalValue") é obrigatório.'
      }),

    totalSavings: z
      .number({
        invalid_type_error: 'O campo Desconto Total ("totalSavings") deve ser um number.',
        required_error: 'O campo Desconto Total ("totalSavings") é obrigatório.'
      }),

    isRecurring: z
      .boolean({
        invalid_type_error: 'O campo Compra Recorrente ("isRecurring") deve ser um boolean.',
        required_error: 'O campo Compra Recorrente ("isRecurring") é obrigatório.'
      }),

    notes: z
      .string({
        invalid_type_error: 'O campo Observações ("notes") deve ser uma string.',
        required_error: 'O campo Observações ("notes") é obrigatório.'
      })
      .optional(),

    statusId: z
      .number({
        invalid_type_error: 'O campo Status ("statusId") deve ser um number.',
        required_error: 'O campo Status ("statusId") é obrigatório.'
      })
      .gte(1, {
        message: 'O campo Status ("statusId") deve 1 (ativo), 2 (inativo) ou 3 (excluído).'
      })
      .lte(3, {
        message: 'O campo Status ("statusId") deve 1 (ativo), 2 (inativo) ou 3 (excluído).'
      })
  })

  const createOneOrderItemPayloadSchema = z.object({
    medicineName: z
      .string({
        invalid_type_error: 'O campo Nome do Medicamento ("medicineName") deve ser uma string.',
        required_error: 'O campo Nome do Medicamento ("medicineName") é obrigatório.'
      })
      .min(1, {
        message: 'O campo Nome do Medicamento ("medicineName") deve ter pelo menos 1 caractere.'
      }),

    medicineType: z
      .string({
        invalid_type_error: 'O campo Tipo do Medicamento ("medicineType") deve ser uma string.',
        required_error: 'O campo Tipo do Medicamento ("medicineType") é obrigatório.'
      })
      .min(1, {
        message: 'O campo Tipo do Medicamento ("medicineType") deve ter pelo menos 1 caracteres.'
      }),

    quantity: z
      .number({
        invalid_type_error: 'O campo Quantidade ("quantity") deve ser um number.',
        required_error: 'O campo Quantidade ("quantity") é obrigatório.'
      })
      .gte(1, {
        message: 'O campo Quantidade ("quantity") deve ser maior ou igual a 1.'
      }),

    listPrice: z
      .number({
        invalid_type_error: 'O campo Preço de Tabela ("listPrice") deve ser um number.',
        required_error: 'O campo Preço de Tabela ("listPrice") é obrigatório.'
      }),

    discountPrice: z
      .number({
        invalid_type_error: 'O campo Preço com Desconto ("discountPrice") deve ser um number.',
        required_error: 'O campo Preço com Desconto ("discountPrice") é obrigatório.'
      })
  })

  const orderItems: ItemToBeCreated[] = req.body.items

  try {
    createOneOrderPayloadSchema.parse({
      memberId: req.body.memberId,
      totalValue: req.body.totalValue,
      totalSavings: req.body.totalSavings,
      isRecurring: req.body.isRecurring,
      notes: req.body.notes,
      statusId: req.body.statusId
    })

    orderItems.forEach((item) => {
      createOneOrderItemPayloadSchema.parse(item)
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  next()
}

export default { validateCreateOnePayload }

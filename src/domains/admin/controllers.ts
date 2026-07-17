/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { HttpStatusCode } from 'axios'
import { type Request, type Response } from 'express'

import adminServices from './services'
import type { role } from '../../enums/roleEnum'

const countClients = async (req: Request, res: Response): Promise<Response> => {
  const CLIENT_COUNT_FETCHED = 'Contagem de clientes recuperada com sucesso.'

  const requestUserRoleId = parseInt(req.headers['request-user-role-id'] as string) as role
  const requestUserClientId = req.headers['request-user-client-id'] as string | null

  const clientsCount = await adminServices.countClients(requestUserRoleId, requestUserClientId)

  return res.status(HttpStatusCode.Ok).json({ message: CLIENT_COUNT_FETCHED, clientsCount })
}

const getRevenue = async (req: Request, res: Response): Promise<Response> => {
  const REVENUE_AND_DELINQUENCY_FOUND = 'Dados financeiros recuperados com sucesso.'

  const requestUserRoleId = parseInt(req.headers['request-user-role-id'] as string) as role
  const requestUserClientId = req.headers['request-user-client-id'] as string | null

  const revenueAndDelinquencyData = await adminServices.getRevenue(
    requestUserRoleId,
    requestUserClientId
  )

  return res.status(HttpStatusCode.Ok).json({ message: REVENUE_AND_DELINQUENCY_FOUND, revenueAndDelinquencyData })
}

const getMonthlyBillings = async (req: Request, res: Response): Promise<Response> => {
  const BILLINGS_FOUND = 'Cobranças recuperadas com sucesso.'

  const month = parseInt(req.query.month as string)
  const year = parseInt(req.query.year as string)

  const billingData = await adminServices.getMonthlyBillings(month, year)

  return res.status(HttpStatusCode.Ok).json({ message: BILLINGS_FOUND, billingData })
}

const updateBillingStatus = async (req: Request, res: Response): Promise<Response> => {
  const BILLING_UPDATED = 'Cobrança atualizada com sucesso.'
  const billingStatus = req.body.status as string

  await adminServices.updateBillingStatus(req.params.id, billingStatus)

  return res.status(HttpStatusCode.Ok).json({ message: BILLING_UPDATED })
}

export default { countClients, getMonthlyBillings, getRevenue, updateBillingStatus }

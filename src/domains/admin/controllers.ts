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

  const requestAdminRoleId = parseInt(req.headers['request-admin-role-id'] as string) as role
  const requestAdminClientId = req.headers['request-admin-client-id'] as string | null

  const revenueAndDelinquencyData = await adminServices.getRevenue(
    requestAdminRoleId,
    requestAdminClientId
  )

  return res.status(HttpStatusCode.Ok).json({ message: REVENUE_AND_DELINQUENCY_FOUND, revenueAndDelinquencyData })
}

export default { countClients, getRevenue }

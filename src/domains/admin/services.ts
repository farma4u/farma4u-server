import clientRepositories from '../client/repositories'
import type { BillingData, BillingSummary, ClientsCount, RevenueData } from './interfaces'
import type { CountClientsWhere } from '../client/interfaces'
import { role } from '../../enums/roleEnum'
import { BadRequestError, InternalServerError } from '../../errors'
import { status } from '../../enums/statusEnum'
import prismaClient from '../../database/connection'

const BILLING_STATUS = ['pending', 'paid', 'defaulting'] as const

const countClients = async (requestUserRoleId: role, requestUserClientId: string | null): Promise<ClientsCount> => {
  const where: CountClientsWhere = {}

  if (requestUserRoleId === role.CLIENT_ADMIN) {
    if (requestUserClientId === null) throw new InternalServerError('Falha ao identificar o cliente.')

    Object.assign(where, { id: requestUserClientId })
  }

  const activeCount = await clientRepositories.count({ ...where, statusId: status.ACTIVE })
  const inactiveCount = await clientRepositories.count({ ...where, statusId: status.INACTIVE })
  const defaultingCount = await clientRepositories.count({ ...where, statusId: status.DEFAULTING })
  const deletedCount = await clientRepositories.count({ ...where, statusId: status.DELETED })

  return {
    activeCount,
    inactiveCount,
    defaultingCount,
    deletedCount
  }
}

const getRevenue = async (requestUserRoleId: role, requestUserClientId: string | null): Promise<RevenueData> => {
  const where: CountClientsWhere = {}

  if (requestUserRoleId === role.CLIENT_ADMIN) {
    if (requestUserClientId === null) throw new InternalServerError('Falha ao identificar o cliente.')

    Object.assign(where, { id: requestUserClientId })
  }

  const revenue = await clientRepositories.sumRevenue(where)
  const defaulting = await clientRepositories.sumDefaulting(where)

  return {
    revenue,
    defaulting
  }
}

const validateBillingPeriod = (month: number, year: number): void => {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new BadRequestError('Mês inválido.')
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new BadRequestError('Ano inválido.')
}

const ensureMonthlyBillings = async (month: number, year: number): Promise<void> => {
  const clients = await prismaClient.client.findMany({
    where: {
      statusId: { in: [status.ACTIVE, status.DEFAULTING] }
    },
    select: {
      dueDay: true,
      id: true,
      lumpSum: true
    }
  })

  await prismaClient.clientBilling.createMany({
    data: clients.map((client) => ({
      amount: client.lumpSum ?? 0,
      clientId: client.id,
      dueDay: client.dueDay,
      month,
      year
    })),
    skipDuplicates: true
  })
}

const getBillingSummary = (billings: Array<{ amount: number, status: string }>): BillingSummary => {
  const summary: BillingSummary = {
    defaultingAmount: 0,
    defaultingCount: 0,
    paidAmount: 0,
    paidCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    totalAmount: 0,
    totalCount: billings.length
  }

  billings.forEach((billing) => {
    summary.totalAmount += billing.amount

    if (billing.status === 'paid') {
      summary.paidAmount += billing.amount
      summary.paidCount += 1
    } else if (billing.status === 'defaulting') {
      summary.defaultingAmount += billing.amount
      summary.defaultingCount += 1
    } else {
      summary.pendingAmount += billing.amount
      summary.pendingCount += 1
    }
  })

  return summary
}

const getMonthlyBillings = async (month: number, year: number): Promise<BillingData> => {
  validateBillingPeriod(month, year)
  await ensureMonthlyBillings(month, year)

  const billings = await prismaClient.clientBilling.findMany({
    where: { month, year },
    select: {
      amount: true,
      client: {
        select: {
          cnpj: true,
          fantasyName: true,
          id: true
        }
      },
      dueDay: true,
      id: true,
      month: true,
      paidAt: true,
      status: true,
      year: true
    },
    orderBy: [
      { dueDay: 'asc' },
      { client: { fantasyName: 'asc' } }
    ]
  })

  return {
    billings,
    summary: getBillingSummary(billings)
  }
}

const updateBillingStatus = async (id: string, billingStatus: string): Promise<void> => {
  if (!BILLING_STATUS.includes(billingStatus as typeof BILLING_STATUS[number])) {
    throw new BadRequestError('Status financeiro inválido.')
  }

  await prismaClient.clientBilling.update({
    data: {
      paidAt: billingStatus === 'paid' ? new Date() : null,
      status: billingStatus
    },
    where: { id }
  })
}

export default { countClients, getBillingSummary, getMonthlyBillings, getRevenue, updateBillingStatus }

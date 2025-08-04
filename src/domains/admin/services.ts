import clientRepositories from '../client/repositories'
import type { ClientsCount, RevenueData } from './interfaces'
import type { CountClientsWhere } from '../client/interfaces'
import { role } from '../../enums/roleEnum'
import { InternalServerError } from '../../errors'
import { status } from '../../enums/statusEnum'

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

  const revenue = await clientRepositories.count({ ...where, statusId: status.ACTIVE })
  const defaulting = await clientRepositories.count({ ...where, statusId: status.DEFAULTING })

  return {
    revenue,
    defaulting
  }
}

export default { countClients, getRevenue }

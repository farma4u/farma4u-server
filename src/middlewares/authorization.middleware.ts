import { type NextFunction, type Request, type Response } from 'express'

import { ForbiddenError } from '../errors'
import { role } from '../enums/roleEnum'

const checkIfIsAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const isAdmin = req.headers['request-user-role-id'] === JSON.stringify(role.ADMIN)

  if (!isAdmin) throw new ForbiddenError()

  next()
}

// Middleware desenvolvido especificamente para o endpoint de detalhes de um cliente,
// que será consumido por usuários (admin) e associados (member)
const checkIfIsAdminOrMember = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const isAdmin = req.headers['request-user-role-id'] === JSON.stringify(role.ADMIN)
  const isMember = req.headers['request-user-role-id'] === JSON.stringify(role.MEMBER)

  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  if (isAdmin) return next()
  if (!isMember) throw new ForbiddenError()

  const requestUserId = req.headers['request-user-id']
  const userId = req.params.id

  if (requestUserId !== userId) throw new ForbiddenError()

  next()
}

export { checkIfIsAdmin, checkIfIsAdminOrMember }

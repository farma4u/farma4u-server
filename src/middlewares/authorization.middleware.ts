import { type NextFunction, type Request, type Response } from 'express'

import { ForbiddenError } from '../errors'
import { role } from '../enums/roleEnum'

// Verifica se é usuário MASTER
export async function checkIfIsMaster (req: Request, _res: Response, next: NextFunction): Promise<void> {
  const isMaster = req.headers['request-user-role-id'] === JSON.stringify(role.MASTER)

  if (!isMaster) throw new ForbiddenError()

  next()
}

// Verifica se é um usuário de sistema (MASTER ou CLIENT_ADMIN)
export async function checkIfIsMasterOrClient (req: Request, _res: Response, next: NextFunction): Promise<void> {
  const isMaster = req.headers['request-user-role-id'] === JSON.stringify(role.MASTER)
  const isClientAdmin = req.headers['request-user-role-id'] === JSON.stringify(role.CLIENT_ADMIN)

  if (!isMaster && !isClientAdmin) throw new ForbiddenError()

  next()
}

// Middleware desenvolvido especificamente para o endpoint de detalhes de um cliente,
// que será consumido por usuários (master ou client) e associados (member)
export async function checkIfIsMasterOrClientOrMember (req: Request, _res: Response, next: NextFunction): Promise<void> {
  const isMaster = req.headers['request-user-role-id'] === JSON.stringify(role.MASTER)
  const isClientAdmin = req.headers['request-user-role-id'] === JSON.stringify(role.CLIENT_ADMIN)
  const isMember = req.headers['request-user-role-id'] === JSON.stringify(role.MEMBER)

  if (!isMaster && !isClientAdmin && !isMember) throw new ForbiddenError()

  next()
}

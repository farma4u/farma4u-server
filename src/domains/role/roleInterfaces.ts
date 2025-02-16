import type { Role } from '@prisma/client'

export type RoleMinData = Pick<Role, 'id' | 'translation'>

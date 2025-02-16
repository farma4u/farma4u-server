import type { Status } from '@prisma/client'

export type StatusToBeReturned = Pick<Status, 'id' | 'translation'>

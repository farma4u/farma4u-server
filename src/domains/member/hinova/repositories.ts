import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import prismaClient from '../../../database/connection'
import { status } from '../../../enums/statusEnum'
import { prismaErrors } from '../../../enums/prismaErrors'
import { DatabaseError } from '../../../errors'

export async function inactivateAllHinovaMembersRepository (): Promise<void> {
  try {
    await prismaClient.member.updateMany({
      data: { statusId: status.INACTIVE },
      where: {
        AND: [
          { statusId: status.ACTIVE },
          { isHinova: true }
        ]
      }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaErrors.NOT_FOUND)
    ) logger.error('Nenhum associado da Hinova encontrado.')

    throw new DatabaseError(error)
  }
}

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import prismaClient from '../../database/connection'
import { status } from '../../enums/statusEnum'
import { prismaError } from '../../enums/prismaError'
import { DatabaseError } from '../../errors'
import type { IHinovaMember } from './interfaces'
import type { Client } from '@prisma/client'

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
      (error.code === prismaError.NOT_FOUND)
    ) logger.error('Nenhum associado da Hinova encontrado.')

    throw new DatabaseError(error)
  }
}

export async function upsertHinovaMembersRepository (clientId: string, hinovaMember: IHinovaMember): Promise<void> {
  try {
    const updateData = {
      clientId,
      statusId: status.ACTIVE,
      isHinova: true
    }

    if (hinovaMember.nome_beneficiario !== '') Object.assign(updateData, { name: hinovaMember.nome_beneficiario })
    if (hinovaMember.email_beneficiario !== '') Object.assign(updateData, { email: hinovaMember.email_beneficiario })
    if (hinovaMember.data_nascimento_beneficiario !== '') Object.assign(updateData, { birthDate: hinovaMember.data_nascimento_beneficiario })
    if (hinovaMember.cep_beneficiario !== '') Object.assign(updateData, { cep: hinovaMember.cep_beneficiario.replace(/\D/g, '') })

    await prismaClient.member.upsert({
      create: {
        clientId,
        cpf: hinovaMember.cpf_beneficiario,
        name: hinovaMember.nome_beneficiario,
        email: hinovaMember.email_beneficiario,
        birthDate: hinovaMember.data_nascimento_beneficiario,
        cep: hinovaMember.cep_beneficiario,
        statusId: status.ACTIVE,
        isHinova: true
      },
      update: updateData,
      where: { cpf: hinovaMember.cpf_beneficiario }
    })
  } catch (error) {
    logger.error({ error }, 'Falha ao criar/atualizar associado da hinova.')
  }
}

export async function findAllHinovaClientsRepository (): Promise<Client[]> {
  try {
    const clients = await prismaClient.client.findMany({
      where: {
        AND: [
          { statusId: status.ACTIVE },
          { isHinova: true },
          { hinovaToken: { not: null } }
        ]
      }
    })

    return clients
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaError.NOT_FOUND)
    ) logger.error('Nenhum cliente integrado à Hinova encontrado.')

    throw new DatabaseError(error)
  }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios, { AxiosError } from 'axios'
import cron from 'node-cron'
import { getEnvironmentVariable } from '../../utils/getEnvironmentVariable'
import { findAllHinovaClientsRepository, inactivateAllHinovaMembersRepository, upsertHinovaMembersRepository } from './repositories'
import type { IHinovaMember, IHinovaMemberListData } from './interfaces'

async function getAllHinovaMembersService (clientHinovaToken: string): Promise<IHinovaMember[]> {
  const HINOVA_BASE_URL = getEnvironmentVariable('HINOVA_BASE_URL')
  const HINOVA_LIST_MEMBERS_URL = getEnvironmentVariable('HINOVA_LIST_MEMBERS_URL')
  const HINOVA_LIST_MEMBERS_PAGINATION_DATA_URL = getEnvironmentVariable('HINOVA_LIST_MEMBERS_PAGINATION_DATA_URL')

  let isFirstIteration = true
  const members: IHinovaMember[] = []
  let membersPagesTotalCount: number
  let currentPage = 1

  try {
    // Requisição para recuperar quantidade total de páginas de beneficiários no SGA da Hinova
    const response = await axios.get<IHinovaMemberListData>(HINOVA_LIST_MEMBERS_PAGINATION_DATA_URL, {
      baseURL: HINOVA_BASE_URL,
      headers: { Authorization: `Bearer ${clientHinovaToken}` }
    })

    membersPagesTotalCount = response.data.quantidade_paginas
  } catch (error) {
    logger.error(
      { error, errorResponseData: error instanceof AxiosError ? error?.response?.data : null },
      'Falha ao recuperar dados de paginação da lista de associados da Hinova.'
    )
    throw new Error('Falha ao recuperar dados de paginação da lista de associados da Hinova.')
  }

  while (isFirstIteration || (currentPage <= membersPagesTotalCount)) {
    try {
      isFirstIteration = false

      // Requisição para recuperar beneficiários no SGA da Hinova
      const response = await axios.get<IHinovaMember[]>(`${HINOVA_LIST_MEMBERS_URL}/${currentPage}`, {
        baseURL: HINOVA_BASE_URL,
        headers: { Authorization: `Bearer ${clientHinovaToken}` }
      })

      members.push(...response.data)
      currentPage += 1
    } catch (error) {
      logger.error(
        { error, errorResponseData: error instanceof AxiosError ? error?.response?.data : null },
        'Falha ao recuperar lista de associados da Hinova.'
      )
      throw new Error('Falha ao recuperar lista de associados da Hinova.')
    }
  }

  return members
}

async function upsertHinovaMembersService (clientId: string, hinovaMembers: IHinovaMember[]): Promise<void> {
  for (const hinovaMember of hinovaMembers) {
    await upsertHinovaMembersRepository(clientId, hinovaMember)
  }
}

export async function processHinovaMembersListService (): Promise<void> {
  // Bloco para capturar erros, visto que o middleware de erros não será acionado pela cron
  try {
    // Inativa todos os associados ativos da Hinova
    await inactivateAllHinovaMembersRepository()

    // Recupera lista de clientes ativos e integrados à Hinova
    const hinovaClients = await findAllHinovaClientsRepository()
    // Remove clientes cadastrados sem o token da hinova
    const hinovaClientsWithToken = hinovaClients.filter(({ hinovaToken }) => hinovaToken !== null && hinovaToken !== '')

    // Itera sob a lista de clientes integrados à Hinova para recuperar seus associados
    for (const hinovaClient of hinovaClientsWithToken) {
      // Bloco para evitar que erros interrompam o loop
      try {
        // Recupera a lista de associados ativos da Hinova desse cliente
        const hinovaMembers = await getAllHinovaMembersService(hinovaClient.hinovaToken!)

        logger.debug(hinovaMembers, 'ASSOCIADOS DA HINOVA')

        // Itera sobre a lista de associados:
        //   - cria os que não existem no DB
        //   - atualiza os que existem no DB
        await upsertHinovaMembersService(hinovaClient.id, hinovaMembers)
      } catch (error) {
        logger.error({ error, hinovaClient }, 'Erro ao processar um cliente da Hinova')
      }
    }
  } catch (error) {
    logger.error(error, 'Erro ao processar atualização de associados da Hinova.')
  }
}

// Rotina para atualizar associados da Hinova todos os dias, às 01:15
export const hinovaMembersUpdateScheduleService = cron.schedule('15 01 * * *', async () => {
  logger.info('Rotina de atualização dos associados da Hinova iniciada.')
  await processHinovaMembersListService()
  logger.info('Rotina de atualização dos associados da Hinova finalizada.')
})

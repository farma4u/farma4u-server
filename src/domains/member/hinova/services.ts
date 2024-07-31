import axios, { AxiosError } from 'axios'
import { getEnvironmentVariable } from '../../../utils/getEnvironmentVariable'
import { getHinovaUserToken } from './auth'
import { inactivateAllHinovaMembersRepository } from './repositories'
import { hinovaSituacao } from './enums'
import { type IHinovaListMembersReturn } from './interfaces'

async function getAllHinovaMembersService (): Promise<string[]> {
  const userToken = await getHinovaUserToken()

  const HINOVA_BASE_URL = getEnvironmentVariable('HINOVA_BASE_URL')
  const HINOVA_LIST_MEMBERS_URL = getEnvironmentVariable('HINOVA_LIST_MEMBERS_URL')

  let isFirstIteration = true
  const members: string[] = []
  let membersTotalCount = 0

  while (isFirstIteration || (members.length < membersTotalCount)) {
    try {
      isFirstIteration = false

      const response = await axios.post<IHinovaListMembersReturn>(HINOVA_LIST_MEMBERS_URL, {
        codigo_situacao: hinovaSituacao.ATIVO,
        inicio_paginacao: members.length,
        quantidade_por_pagina: 500
      }, {
        baseURL: HINOVA_BASE_URL,
        headers: { Authorization: `Bearer ${userToken}` }
      })

      members.push(...response.data.associados)
      membersTotalCount = response.data.total_associados
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

export async function processHinovaMembersListService (): Promise<void> {
  // Inativa todos os associados ativos da Hinova
  await inactivateAllHinovaMembersRepository()

  // Recupera a lista de associados ativos da Hinova
  const hinovaMembers = await getAllHinovaMembersService()

  // Itera sobre a lista de associados:
  //   - cria os que não existem no DB
  //   - atualiza os que existem no DB
}

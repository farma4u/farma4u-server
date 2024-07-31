import axios, { AxiosError } from 'axios'
import { getEnvironmentVariable } from '../../../utils/getEnvironmentVariable'
import { InternalServerError } from '../../../errors'

export async function getHinovaUserToken (): Promise<string> {
  const HINOVA_BASE_URL = getEnvironmentVariable('HINOVA_BASE_URL')
  const HINOVA_AUTH_URL = getEnvironmentVariable('HINOVA_AUTH_URL')
  const HINOVA_USER = getEnvironmentVariable('HINOVA_USER')
  const HINOVA_PASSWORD = getEnvironmentVariable('HINOVA_PASSWORD')
  const HINOVA_SGA_TOKEN = getEnvironmentVariable('HINOVA_SGA_TOKEN')

  try {
    const response = await axios.post<{ token_usuario: string }>(HINOVA_AUTH_URL, {
      usuario: HINOVA_USER,
      senha: HINOVA_PASSWORD
    }, {
      baseURL: HINOVA_BASE_URL,
      headers: { Authorization: `Bearer ${HINOVA_SGA_TOKEN}` }
    })

    return response.data.token_usuario
  } catch (error) {
    logger.error(
      { error, errorResponseData: error instanceof AxiosError ? error?.response?.data : null },
      'Falha ao autenticar na Hinova.'
    )
    throw new InternalServerError('Falha ao autenticar na Hinova.')
  }
}

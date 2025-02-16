export interface FindManyResponse<T> {
  items: T[]
  totalCount: number
}

export interface AccessTokenData {
  id: string
  clientId: string
  roleId: number
}

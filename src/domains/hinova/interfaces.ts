export interface IHinovaListMembersReturn {
  total_associados: number
  associados: string[]
}

export interface IHinovaMember {
  nome_beneficiario: string
  cpf_beneficiario: string
  logradouro_beneficiario: string
  numero_beneficiario: string
  complemento_beneficiario: string
  bairro_beneficiario: string
  cidade_beneficiario: string
  estado_beneficiario: string
  cep_beneficiario: string
  data_nascimento_beneficiario: string
  nome_associado: string
  data_nascimento_associado: string
  cpf_associado: string
  cep_associado: string
  logradouro_associado: string
  numero_associado: string
  complemento_associado: string
  bairro_associado: string
  cidade_associado: string
  estado_associado: string
}

export interface IHinovaMemberListData {
  quantidade_paginas: number
  total_registros: number
}

'use client'

import { FieldValues, useForm } from 'react-hook-form'
import { type ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from 'react'

import { applyCnpjMask, captalize, formatDate, removeCnpjMask } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/DashboardLayout'
import { DataTable } from '../../../components/DataTable'
import { FilterX } from 'lucide-react'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sendRequest } from '@/lib/sendRequest'
import { STATUS } from '@/lib/enums'

interface IClient {
  id: string
  cnpj: string
  fantasyName: string
  segment: string
  status: string
  createdAt: string
}

interface IFormValues {
  cnpj: string
  fantasyName: string
  statusId: string
}

const columns: ColumnDef<IClient>[] = [
  {
    header: `CNPJ`,
    accessorKey: `cnpj`
  },
  {
    header: `Nome Fantasia`,
    accessorKey: `fantasyName`
  },
  {
    header: `Segmento`,
    accessorKey: `segment`
  },
  {
    header: `Status`,
    accessorKey: `status`
  },
  {
    header: `Criado em`,
    accessorKey: `createdAt`
  }
]

const PAGINATION_LIMIT = 10
const FORM_FILTER_DEFAULT_VALUES: IFormValues = {
  cnpj: '',
  fantasyName: '',
  statusId: '1'
}

export default function ClientsPage() {
  const [clients, setClients] = useState<IClient[]>([])
  const [clientsCount, setClientsCount] = useState<number>(0)
  const [skip, setSkip] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<URLSearchParams | null>(null)

  const form = useForm<IFormValues>({
    mode: 'onSubmit',
    defaultValues: FORM_FILTER_DEFAULT_VALUES
  })

  const handleNextPagination = () => {
    setSkip((prev) => prev + PAGINATION_LIMIT)
    setPage((prev) => prev + 1)
  }

  const handlePreviousPagination = () => {
    setSkip((prev) => prev - PAGINATION_LIMIT)
    setPage((prev) => prev - 1)
  }

  const handleResetPagination = () => {
    setSkip(0)
    setPage(1)
  }

  const submitFilter = async (data: FieldValues) => {
    const { cnpj, fantasyName, statusId } = data
    const query = new URLSearchParams()

    if (cnpj) query.append('cnpj', removeCnpjMask(cnpj.trim()))
    if (fantasyName) query.append('fantasy-name', fantasyName.trim())
    if (statusId) query.append('status-id', statusId)

    setQuery(query)
    await fetchClients(query)
  }

  const resetFilter = () => {
    form.reset(FORM_FILTER_DEFAULT_VALUES)

    setSkip(0)
    setPage(1)

    fetchClients()
  }

  const fetchClients = async (query?: URLSearchParams) => {
    const response = await sendRequest<{ clients: Array<{ statusId: number } & Omit<IClient, 'status'>> }>({
      endpoint: `/client?take=${PAGINATION_LIMIT}&skip=${skip}${query ? `&${query.toString()}` : '&status-id=1'}`,
      method: 'GET',
    })

    if (!response.error) {
      const formattedClients = response.data.clients.map(({ cnpj, fantasyName, segment, createdAt, statusId, ...client }) => ({
        cnpj: applyCnpjMask(cnpj),
        fantasyName: captalize(fantasyName),
        segment: captalize(segment),
        createdAt: formatDate(createdAt),
        status: STATUS[statusId],
        ...client
      }))

      setClients(formattedClients)
      setClientsCount(parseInt(response.headers[`x-total-count`]))
    }
  }

  // Carrega lista de clientes
  useEffect(() => {
    if (query) {
      fetchClients(query)
    } else fetchClients()
  }, [skip])

  return (
    <DashboardLayout title="Clientes" counterText={`Total: ${clientsCount} clientes`}>
      <Form { ...form }>
        <form
          className='flex flex-row my-4 gap-4'
          onSubmit={form.handleSubmit((data) => submitFilter(data))}
        >
          <div className="flex flex-col grow space-y-1.5 bg-white">
            <Input { ...form.register("cnpj") } placeholder="CNPJ" type="text" />
          </div>
          <div className="flex flex-col grow space-y-1.5 bg-white">
            <Input { ...form.register("fantasyName") } placeholder="Nome Fantasia" type="text" />
          </div>
          <div className="flex flex-col space-y-1.5 bg-white">
          <FormField
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">{STATUS[1]}</SelectItem>
                    <SelectItem value="2">{STATUS[2]}</SelectItem>
                    <SelectItem value="3">{STATUS[3]}</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          </div>
          <Button className="w-28" type='submit'>
            Filtrar
          </Button>
          <Button
            className="w-9 h-9 p-0"
            onClick={resetFilter}
            title="Limpar filtros"
            type='button'
            variant="outline"
          >
            <FilterX className="w-5 h-5"/>
          </Button>
        </form>
      </Form>

      <DataTable columns={columns} data={clients} />

      <Pagination className="my-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              disabled={page <= 1}
              onClick={handleResetPagination}
              size="default"
              type="button"
            >
              Primeira
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              disabled={page <= 1}
              onClick={handlePreviousPagination}
              type="button"
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              size="default"
              className='cursor-default hover:bg-background'
            >
              {`${page} de ${Math.ceil(clientsCount/PAGINATION_LIMIT)}`}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              disabled={clientsCount <= page * PAGINATION_LIMIT}
              onClick={handleNextPagination}
              type="button"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </DashboardLayout>
  )
}

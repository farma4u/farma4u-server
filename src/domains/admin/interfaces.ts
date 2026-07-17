export interface ClientsCount {
  activeCount: number
  inactiveCount: number
  defaultingCount: number
  deletedCount: number
}

export interface RevenueData {
  revenue: number
  defaulting: number
}

export interface BillingSummary {
  defaultingAmount: number
  defaultingCount: number
  paidAmount: number
  paidCount: number
  pendingAmount: number
  pendingCount: number
  totalAmount: number
  totalCount: number
}

export interface ClientBillingItem {
  amount: number
  client: {
    cnpj: string
    fantasyName: string
    id: string
  }
  dueDay: number | null
  id: string
  month: number
  paidAt: Date | null
  status: string
  year: number
}

export interface BillingData {
  billings: ClientBillingItem[]
  summary: BillingSummary
}

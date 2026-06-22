import { useState, useEffect } from 'react'

export interface CompanyProfile {
  id: string
  name: string
  gstin?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
}

export interface CustomerProfile {
  id: string
  name: string
  businessName?: string
  gstin?: string
  address?: string
  phone?: string
  email?: string
}

export interface SavedQuotation {
  id: string
  quoteNumber: string
  date: string
  clientName: string
  total: number
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired'
  data: any
}

export function useQuotationStorage() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [quotations, setQuotations] = useState<SavedQuotation[]>([])

  useEffect(() => {
    try {
      const storedCompanies = localStorage.getItem('qf_companies')
      if (storedCompanies) setCompanies(JSON.parse(storedCompanies))

      const storedCustomers = localStorage.getItem('qf_customers')
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers))

      const storedQuotations = localStorage.getItem('qf_quotations')
      if (storedQuotations) setQuotations(JSON.parse(storedQuotations))
    } catch (e) {
      console.error('Error loading data from local storage', e)
    }
  }, [])

  const saveCompany = (company: CompanyProfile) => {
    const newCompanies = [...companies.filter(c => c.id !== company.id), company]
    setCompanies(newCompanies)
    localStorage.setItem('qf_companies', JSON.stringify(newCompanies))
  }

  const saveCustomer = (customer: CustomerProfile) => {
    const newCustomers = [...customers.filter(c => c.id !== customer.id), customer]
    setCustomers(newCustomers)
    localStorage.setItem('qf_customers', JSON.stringify(newCustomers))
  }

  const saveQuotation = (quotation: SavedQuotation) => {
    const newQuotations = [quotation, ...quotations.filter(q => q.id !== quotation.id)].slice(0, 50)
    setQuotations(newQuotations)
    localStorage.setItem('qf_quotations', JSON.stringify(newQuotations))
  }

  return {
    companies,
    customers,
    quotations,
    saveCompany,
    saveCustomer,
    saveQuotation
  }
}

import companiesData from '@/data/companies.json'

export interface Company {
  id: string
  slug: string
  name: string
  logo: string
  website: string
  description: string
}

export function getAllCompanies(): Company[] {
  return companiesData as Company[]
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return (companiesData as Company[]).find(company => company.slug === slug)
}

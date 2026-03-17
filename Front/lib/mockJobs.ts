import jobsData from '@/data/jobs.json'

export interface Job {
  id: string
  slug: string
  title: string
  company: {
    id: string
    name: string
    slug: string
    logo: string | null
    verified?: boolean
  }
  salary: string
  location: string
  workType: 'remote' | 'hybrid' | 'office'
  region: 'global' | 'europe' | 'usa' | 'asia'
  specialization: string
  experience: 'intern' | 'junior' | 'mid' | 'senior' | 'lead'
  tags: string[]
  description: string
  requirements: string[]
  postedAt: string
  featured?: boolean
  verified?: boolean
}

export function getAllJobs(): Job[] {
  return jobsData as Job[]
}

export function getJobBySlug(slug: string): Job | undefined {
  return (jobsData as Job[]).find(job => job.slug === slug)
}

export function getJobsByCompany(companySlug: string): Job[] {
  return (jobsData as Job[]).filter(job => job.company.slug === companySlug)
}

export function sortJobs(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    // Featured first
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    // Then verified
    if (a.verified && !b.verified) return -1
    if (!a.verified && b.verified) return 1
    // Then by date (newest first)
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  })
}

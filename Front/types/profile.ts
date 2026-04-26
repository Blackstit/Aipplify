export interface WorkExperience {
  id: string
  company: string
  role: string
  start: string
  end: string
  description: string
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  start: string
  end: string
}

export interface Project {
  id: string
  name: string
  url?: string
  description: string
  tech: string[]
}

export interface PortfolioItem {
  id: string
  title: string
  url: string
  description?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url?: string
}

export interface Language {
  id: string
  language: string
  level: string
}

export interface ProfileFormData {
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  summary: string
  website: string
  linkedin: string
  github: string
  twitter: string
  skills: string[]
  experience: WorkExperience[]
  education: Education[]
  projects: Project[]
  portfolio: PortfolioItem[]
  certifications: Certification[]
  languages: Language[]
}

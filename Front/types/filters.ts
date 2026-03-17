export interface JobFilters {
  workFormat: string[]
  workFormatExclude: string[]
  remoteType: string[]
  remoteTypeExclude: string[]
  specializations: string[]
  excludedSpecializations: string[]
  skills: string[]
  excludedSkills: string[]
  skillsOrMode: boolean
  grade: string[]
  companyType: string[]
  countries: string[]
  excludedCountries: string[]
  jobType: string
  englishLevel: string[]
  vacancyLanguage: string[]
  currency: string[]
  minSalary: string
}

export const defaultFilters: JobFilters = {
  workFormat: [],
  workFormatExclude: [],
  remoteType: [],
  remoteTypeExclude: [],
  specializations: [],
  excludedSpecializations: [],
  skills: [],
  excludedSkills: [],
  skillsOrMode: false,
  grade: [],
  companyType: [],
  countries: [],
  excludedCountries: [],
  jobType: "fulltime",
  englishLevel: [],
  vacancyLanguage: [],
  currency: [],
  minSalary: "",
}

"use client"

import { useState, useEffect } from "react"
import { FilterSection, FilterButton } from "./FilterSection"
import { MultiSelect } from "./MultiSelect"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { HelpCircle, X } from "lucide-react"
import { Save, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JobFilters } from "@/types/filters"
import { defaultFilters } from "@/types/filters"

const specializations = [
  "Frontend", "Backend", "Fullstack", "AI/ML", "Blockchain", 
  "DevOps", "Mobile", "Data Science", "Security", "Product", "QA"
]

const skills = [
  "TypeScript", "JavaScript", "Python", "React", "Node.js", 
  "Vue.js", "Angular", "Go", "Rust", "Java", "C++", "Swift"
]

const countries = [
  "USA", "Canada", "UK", "Germany", "France", "Spain", 
  "Netherlands", "Poland", "Ukraine", "Russia", "Remote"
]

interface FiltersSidebarProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
}

export function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [workFormat, setWorkFormat] = useState<string[]>(filters.workFormat)
  const [workFormatExclude, setWorkFormatExclude] = useState<string[]>(filters.workFormatExclude)
  const [remoteType, setRemoteType] = useState<string[]>(filters.remoteType)
  const [remoteTypeExclude, setRemoteTypeExclude] = useState<string[]>(filters.remoteTypeExclude)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(filters.specializations)
  const [excludedSpecializations, setExcludedSpecializations] = useState<string[]>(filters.excludedSpecializations)
  const [skillsOrMode, setSkillsOrMode] = useState(filters.skillsOrMode)
  const [skillsExcluded, setSkillsExcluded] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills)
  const [excludedSkills, setExcludedSkills] = useState<string[]>(filters.excludedSkills)
  const [grade, setGrade] = useState<string[]>(filters.grade)
  const [companyType, setCompanyType] = useState<string[]>(filters.companyType)
  const [selectedCountries, setSelectedCountries] = useState<string[]>(filters.countries)
  const [excludedCountries, setExcludedCountries] = useState<string[]>(filters.excludedCountries)
  const [jobType, setJobType] = useState<string>(filters.jobType)
  const [englishLevel, setEnglishLevel] = useState<string[]>(filters.englishLevel)
  const [vacancyLanguage, setVacancyLanguage] = useState<string[]>(filters.vacancyLanguage)
  const [currency, setCurrency] = useState<string[]>(filters.currency)
  const [minSalary, setMinSalary] = useState(filters.minSalary)

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange({
      workFormat,
      workFormatExclude,
      remoteType,
      remoteTypeExclude,
      specializations: selectedSpecializations,
      excludedSpecializations,
      skills: selectedSkills,
      excludedSkills,
      skillsOrMode,
      grade,
      companyType,
      countries: selectedCountries,
      excludedCountries,
      jobType,
      englishLevel,
      vacancyLanguage,
      currency,
      minSalary,
    })
  }, [
    workFormat,
    workFormatExclude,
    remoteType,
    remoteTypeExclude,
    selectedSpecializations,
    excludedSpecializations,
    selectedSkills,
    excludedSkills,
    skillsOrMode,
    grade,
    companyType,
    selectedCountries,
    excludedCountries,
    jobType,
    englishLevel,
    vacancyLanguage,
    currency,
    minSalary,
    onFiltersChange,
  ])

  const toggleFilter = (filters: string[], setFilters: (f: string[]) => void, value: string) => {
    if (filters.includes(value)) {
      setFilters(filters.filter(f => f !== value))
    } else {
      setFilters([...filters, value])
    }
  }

  const handleReset = () => {
    setWorkFormat([])
    setWorkFormatExclude([])
    setRemoteType([])
    setRemoteTypeExclude([])
    setSelectedSpecializations([])
    setExcludedSpecializations([])
    setSelectedSkills([])
    setExcludedSkills([])
    setSkillsOrMode(false)
    setSkillsExcluded(false)
    setGrade([])
    setCompanyType([])
    setSelectedCountries([])
    setExcludedCountries([])
    setJobType("fulltime")
    setEnglishLevel([])
    setVacancyLanguage([])
    setCurrency([])
    setMinSalary("")
    onFiltersChange({
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
    })
  }

  return (
    <div className="space-y-4">
      <FilterSection 
        title="Work Format" 
        showHelp
        excludeChildren={
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="Remote"
              selected={workFormatExclude.includes("remote")}
              onClick={() => toggleFilter(workFormatExclude, setWorkFormatExclude, "remote")}
            />
            <FilterButton
              label="Hybrid"
              selected={workFormatExclude.includes("hybrid")}
              onClick={() => toggleFilter(workFormatExclude, setWorkFormatExclude, "hybrid")}
            />
            <FilterButton
              label="Office"
              selected={workFormatExclude.includes("office")}
              onClick={() => toggleFilter(workFormatExclude, setWorkFormatExclude, "office")}
            />
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Remote"
            selected={workFormat.includes("remote")}
            onClick={() => toggleFilter(workFormat, setWorkFormat, "remote")}
          />
          <FilterButton
            label="Hybrid"
            selected={workFormat.includes("hybrid")}
            onClick={() => toggleFilter(workFormat, setWorkFormat, "hybrid")}
          />
          <FilterButton
            label="Office"
            selected={workFormat.includes("office")}
            onClick={() => toggleFilter(workFormat, setWorkFormat, "office")}
          />
        </div>
      </FilterSection>

      <FilterSection 
        title="Remote Type" 
        showHelp
        excludeChildren={
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="Global"
              selected={remoteTypeExclude.includes("global")}
              onClick={() => toggleFilter(remoteTypeExclude, setRemoteTypeExclude, "global")}
            />
            <FilterButton
              label="Russia"
              selected={remoteTypeExclude.includes("russia")}
              onClick={() => toggleFilter(remoteTypeExclude, setRemoteTypeExclude, "russia")}
            />
            <FilterButton
              label="Europe"
              selected={remoteTypeExclude.includes("europe")}
              onClick={() => toggleFilter(remoteTypeExclude, setRemoteTypeExclude, "europe")}
            />
            <FilterButton
              label="USA"
              selected={remoteTypeExclude.includes("usa")}
              onClick={() => toggleFilter(remoteTypeExclude, setRemoteTypeExclude, "usa")}
            />
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Global"
            selected={remoteType.includes("global")}
            onClick={() => toggleFilter(remoteType, setRemoteType, "global")}
          />
          <FilterButton
            label="Russia"
            selected={remoteType.includes("russia")}
            onClick={() => toggleFilter(remoteType, setRemoteType, "russia")}
          />
          <FilterButton
            label="Europe"
            selected={remoteType.includes("europe")}
            onClick={() => toggleFilter(remoteType, setRemoteType, "europe")}
          />
          <FilterButton
            label="USA"
            selected={remoteType.includes("usa")}
            onClick={() => toggleFilter(remoteType, setRemoteType, "usa")}
          />
        </div>
      </FilterSection>

      <FilterSection 
        title="Specializations" 
        showHelp
        excludeChildren={
          <MultiSelect
            options={specializations}
            selected={excludedSpecializations}
            onSelectionChange={setExcludedSpecializations}
            placeholder="Exclude specializations"
            variant="exclude"
          />
        }
      >
        <MultiSelect
          options={specializations}
          selected={selectedSpecializations}
          onSelectionChange={setSelectedSpecializations}
          placeholder="Search specializations"
        />
      </FilterSection>

      <FilterSection 
        title="Skills" 
        showHelp={false}
        excluded={skillsExcluded}
        onExcludeToggle={setSkillsExcluded}
        excludeChildren={
          <MultiSelect
            options={skills}
            selected={excludedSkills}
            onSelectionChange={setExcludedSkills}
            placeholder="Exclude skills"
            variant="exclude"
          />
        }
        customHeader={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Skills</h3>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={skillsOrMode}
                onCheckedChange={setSkillsOrMode}
                label={skillsOrMode ? "OR" : "AND"}
              />
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs",
                  skillsExcluded && "bg-gray-100"
                )}
                onClick={() => setSkillsExcluded(!skillsExcluded)}
              >
                <X className="h-3 w-3 mr-1" />
                Exclude
              </Button>
            </div>
          </div>
        }
      >
        <MultiSelect
          options={skills}
          selected={selectedSkills}
          onSelectionChange={setSelectedSkills}
          placeholder="Search skills"
        />
      </FilterSection>

      <FilterSection title="Grade" showHelp>
        <div className="grid grid-cols-3 gap-2">
          {["Intern", "Junior", "Middle", "Senior", "Lead", "Head", "Director", "C-level"].map((level) => (
            <FilterButton
              key={level}
              label={level}
              selected={grade.includes(level.toLowerCase())}
              onClick={() => toggleFilter(grade, setGrade, level.toLowerCase())}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Company Type" showHelp>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Startup"
            selected={companyType.includes("startup")}
            onClick={() => toggleFilter(companyType, setCompanyType, "startup")}
          />
          <FilterButton
            label="Corporation"
            selected={companyType.includes("corporation")}
            onClick={() => toggleFilter(companyType, setCompanyType, "corporation")}
          />
          <FilterButton
            label="Product Company"
            selected={companyType.includes("product")}
            onClick={() => toggleFilter(companyType, setCompanyType, "product")}
          />
          <FilterButton
            label="Outsource"
            selected={companyType.includes("outsource")}
            onClick={() => toggleFilter(companyType, setCompanyType, "outsource")}
          />
        </div>
      </FilterSection>

      <FilterSection 
        title="Location" 
        showHelp
        excludeChildren={
          <MultiSelect
            options={countries}
            selected={excludedCountries}
            onSelectionChange={setExcludedCountries}
            placeholder="Exclude locations"
            variant="exclude"
          />
        }
      >
        <MultiSelect
          options={countries}
          selected={selectedCountries}
          onSelectionChange={setSelectedCountries}
          placeholder="Search countries"
        />
      </FilterSection>

      <FilterSection title="Job Type" showHelp>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Full-time"
            selected={jobType === "fulltime"}
            onClick={() => setJobType("fulltime")}
          />
          <FilterButton
            label="Part-time"
            selected={jobType === "parttime"}
            onClick={() => setJobType("parttime")}
          />
          <FilterButton
            label="Project"
            selected={jobType === "project"}
            onClick={() => setJobType("project")}
          />
        </div>
      </FilterSection>

      <FilterSection title="English Level" showHelp>
        <div className="grid grid-cols-3 gap-2">
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
            <FilterButton
              key={level}
              label={level}
              selected={englishLevel.includes(level)}
              onClick={() => toggleFilter(englishLevel, setEnglishLevel, level)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Vacancy Language">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Ru"
            selected={vacancyLanguage.includes("ru")}
            onClick={() => toggleFilter(vacancyLanguage, setVacancyLanguage, "ru")}
          />
          <FilterButton
            label="En"
            selected={vacancyLanguage.includes("en")}
            onClick={() => toggleFilter(vacancyLanguage, setVacancyLanguage, "en")}
          />
          <FilterButton
            label="Ua"
            selected={vacancyLanguage.includes("ua")}
            onClick={() => toggleFilter(vacancyLanguage, setVacancyLanguage, "ua")}
          />
        </div>
      </FilterSection>

      <FilterSection title="Currency" showHelp>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="RUB"
            selected={currency.includes("rub")}
            onClick={() => toggleFilter(currency, setCurrency, "rub")}
          />
          <FilterButton
            label="USD"
            selected={currency.includes("usd")}
            onClick={() => toggleFilter(currency, setCurrency, "usd")}
          />
          <FilterButton
            label="EUR"
            selected={currency.includes("eur")}
            onClick={() => toggleFilter(currency, setCurrency, "eur")}
          />
        </div>
      </FilterSection>

      <FilterSection title="Min Salary" showHelp showExclude={false}>
        <Input 
          type="number" 
          placeholder="0" 
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
        />
      </FilterSection>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="icon" onClick={handleReset} className="flex-1">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button className="flex-1 bg-gradient-primary hover:bg-gradient-primary-hover text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Filter
        </Button>
      </div>
    </div>
  )
}

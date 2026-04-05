"use client"

import { useState, useEffect, useRef } from "react"
import { FilterSection, FilterButton } from "./FilterSection"
import { MultiSelect } from "./MultiSelect"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { HelpCircle, X, RotateCcw, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JobFilters } from "@/types/filters"

interface Facets {
  skills: { name: string; count: number }[]
  roles: { name: string; count: number }[]
  seniority: { name: string; count: number }[]
  domains: { name: string; count: number }[]
}

interface FiltersSidebarProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
}

export function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [facets, setFacets] = useState<Facets | null>(null)

  const [workFormat, setWorkFormat] = useState<string[]>(filters.workFormat)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(filters.specializations)
  const [excludedSpecializations, setExcludedSpecializations] = useState<string[]>(filters.excludedSpecializations)
  const [skillsOrMode, setSkillsOrMode] = useState(filters.skillsOrMode)
  const [skillsExcluded, setSkillsExcluded] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(filters.skills)
  const [excludedSkills, setExcludedSkills] = useState<string[]>(filters.excludedSkills)
  const [grade, setGrade] = useState<string[]>(filters.grade)
  const [minSalary, setMinSalary] = useState(filters.minSalary)
  const [maxSalary, setMaxSalary] = useState("")
  const [scoreMin, setScoreMin] = useState("")
  const [scoreMax, setScoreMax] = useState("")

  const onFiltersChangeRef = useRef(onFiltersChange)
  onFiltersChangeRef.current = onFiltersChange

  useEffect(() => {
    fetch("/api/jobs/facets")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setFacets(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChangeRef.current({
        workFormat,
        workFormatExclude: [],
        remoteType: [],
        remoteTypeExclude: [],
        specializations: selectedSpecializations,
        excludedSpecializations,
        skills: selectedSkills,
        excludedSkills,
        skillsOrMode,
        grade,
        companyType: [],
        countries: [],
        excludedCountries: [],
        jobType: "",
        englishLevel: [],
        vacancyLanguage: [],
        currency: [],
        minSalary,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [
    workFormat, selectedSpecializations, excludedSpecializations,
    selectedSkills, excludedSkills, skillsOrMode, grade, minSalary,
    maxSalary, scoreMin, scoreMax,
  ])

  const toggleFilter = (arr: string[], set: (f: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter((f) => f !== val) : [...arr, val])
  }

  const handleReset = () => {
    setWorkFormat([])
    setSelectedSpecializations([])
    setExcludedSpecializations([])
    setSelectedSkills([])
    setExcludedSkills([])
    setSkillsOrMode(false)
    setSkillsExcluded(false)
    setGrade([])
    setMinSalary("")
    setMaxSalary("")
    setScoreMin("")
    setScoreMax("")
  }

  const skillOptions = facets?.skills?.map((s) => s.name) || []
  const roleOptions = facets?.roles?.map((r) => r.name) || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Filters</h2>
      <FilterSection title="Work Format">
        <div className="flex flex-wrap gap-1.5">
          {["Remote", "Hybrid", "Office"].map((label) => (
            <FilterButton
              key={label}
              label={label}
              selected={workFormat.includes(label.toLowerCase())}
              onClick={() => toggleFilter(workFormat, setWorkFormat, label.toLowerCase())}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Grade">
        <div className="flex flex-wrap gap-1.5">
          {["Intern", "Junior", "Middle", "Senior", "Lead"].map((level) => (
            <FilterButton
              key={level}
              label={level}
              selected={grade.includes(level.toLowerCase())}
              onClick={() => toggleFilter(grade, setGrade, level.toLowerCase())}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Specializations">
        <MultiSelect
          options={roleOptions.length > 0 ? roleOptions : ["Developer", "Designer", "Manager", "Analyst", "DevOps", "QA"]}
          selected={selectedSpecializations}
          onSelectionChange={setSelectedSpecializations}
          placeholder="Search roles..."
        />
      </FilterSection>

      <FilterSection
        title="Skills"
        showHelp={false}
        excluded={skillsExcluded}
        onExcludeToggle={setSkillsExcluded}
        excludeChildren={
          <MultiSelect
            options={skillOptions}
            selected={excludedSkills}
            onSelectionChange={setExcludedSkills}
            placeholder="Exclude skills"
            variant="exclude"
          />
        }
        customHeader={
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Skills</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 uppercase">{skillsOrMode ? "or" : "and"}</span>
              <Switch
                checked={skillsOrMode}
                onCheckedChange={setSkillsOrMode}
              />
              <button
                type="button"
                className={cn(
                  "h-5 px-1.5 text-[10px] rounded border transition-colors",
                  skillsExcluded
                    ? "border-rose-300 text-rose-600 bg-rose-50"
                    : "border-gray-200 text-gray-400 hover:text-gray-600",
                )}
                onClick={() => setSkillsExcluded(!skillsExcluded)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        }
      >
        <MultiSelect
          options={skillOptions.length > 0 ? skillOptions : ["TypeScript", "Python", "React", "Node.js", "Go", "Rust", "Java"]}
          selected={selectedSkills}
          onSelectionChange={setSelectedSkills}
          placeholder="Search skills..."
        />
      </FilterSection>

      <FilterSection title="Salary (USD)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="h-8 text-sm"
          />
          <span className="text-gray-400 text-xs">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </FilterSection>

      <FilterSection title="AI Score">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Star className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-400" />
            <Input
              type="number"
              placeholder="Min"
              min={0}
              max={10}
              step={0.1}
              value={scoreMin}
              onChange={(e) => setScoreMin(e.target.value)}
              className="h-8 text-sm pl-7"
            />
          </div>
          <span className="text-gray-400 text-xs">–</span>
          <div className="relative flex-1">
            <Star className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-400" />
            <Input
              type="number"
              placeholder="Max"
              min={0}
              max={10}
              step={0.1}
              value={scoreMax}
              onChange={(e) => setScoreMax(e.target.value)}
              className="h-8 text-sm pl-7"
            />
          </div>
        </div>
      </FilterSection>

      <div className="pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full text-xs h-7 text-gray-500 hover:text-gray-800"
        >
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}

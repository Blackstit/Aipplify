export const GA_ID = "G-K2EDYZ4457"

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag(...args)
}

export function pageview(url: string) {
  gtag("config", GA_ID, { page_path: url })
}

export function event(action: string, params?: Record<string, unknown>) {
  gtag("event", action, params)
}

// Job events
export function trackJobView(jobSlug: string, jobTitle: string, companyName: string) {
  event("job_view", { job_slug: jobSlug, job_title: jobTitle, company_name: companyName })
}

export function trackApplyClick(jobSlug: string, jobTitle: string, companyName?: string) {
  event("job_apply_click", { job_slug: jobSlug, job_title: jobTitle, company_name: companyName })
}

export function trackApplySuccess(jobSlug: string, jobTitle: string, companyName?: string) {
  event("job_apply_success", { job_slug: jobSlug, job_title: jobTitle, company_name: companyName })
}

export function trackJobSave(jobSlug: string, jobTitle: string) {
  event("job_save", { job_slug: jobSlug, job_title: jobTitle })
}

export function trackJobUnsave(jobSlug: string, jobTitle: string) {
  event("job_unsave", { job_slug: jobSlug, job_title: jobTitle })
}

// Auth events
export function trackLogin(userType: string) {
  event("login", { method: "email", user_type: userType })
}

export function trackSignUp(userType: string) {
  event("sign_up", { method: "email", user_type: userType })
}

// Search
export function trackSearch(query: string) {
  event("search", { search_term: query })
}

// Contact form
export function trackContactSubmit() {
  event("contact_form_submit")
}

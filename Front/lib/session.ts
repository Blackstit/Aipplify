"use client"

export interface User {
  id: string
  email: string
  name: string | null
  type: "CANDIDATE" | "RECRUITER"
  role: "USER" | "MODERATOR" | "ADMIN"
  status: "ACTIVE" | "BANNED" | "DELETED"
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    
    const user = JSON.parse(userStr)
    return user as User
  } catch {
    return null
  }
}

export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return
  
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return
  
  localStorage.removeItem("user")
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function isRecruiter(): boolean {
  const user = getCurrentUser()
  return user?.type === "RECRUITER" || false
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "ADMIN" || false
}

export function isModerator(): boolean {
  const user = getCurrentUser()
  return (user?.role === "MODERATOR" || user?.role === "ADMIN") || false
}

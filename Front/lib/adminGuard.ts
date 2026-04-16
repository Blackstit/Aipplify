import { prisma } from "@/lib/prisma"

export interface AdminActor {
  id: string
  role: "ADMIN" | "MODERATOR"
}

export async function getAdminFromRequest(request: Request): Promise<AdminActor | null> {
  const userId = request.headers.get("x-user-id")
  if (!userId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    })
    if (!user || user.status !== "ACTIVE") return null
    if (user.role !== "ADMIN" && user.role !== "MODERATOR") return null
    return { id: user.id, role: user.role as "ADMIN" | "MODERATOR" }
  } catch {
    return null
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    deletedUsers,
    candidates,
    recruiters,
    adminsCount,
    moderatorsCount,
    todayNew,
    weekNew,
    monthNew,
    totalJobs,
    publishedJobs,
    totalApplications,
    recentUsers,
    roleBreakdown,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "BANNED" } }),
    prisma.user.count({ where: { status: "DELETED" } }),
    prisma.user.count({ where: { type: "CANDIDATE" } }),
    prisma.user.count({ where: { type: "RECRUITER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "MODERATOR" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        role: true,
        status: true,
        createdAt: true,
        emailVerified: true,
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
      orderBy: { role: "asc" },
    }),
  ])

  // Build daily signups for last 7 days
  const usersLast7 = await prisma.user.findMany({
    where: { createdAt: { gte: weekAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  const dailyMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    dailyMap[key] = 0
  }
  for (const u of usersLast7) {
    const key = u.createdAt.toISOString().slice(0, 10)
    if (key in dailyMap) dailyMap[key]++
  }
  const dailySignups = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  const roleMap: Record<string, number> = {}
  for (const r of roleBreakdown) {
    const cnt = r._count
    roleMap[r.role] = typeof cnt === "object" && cnt ? (cnt._all ?? 0) : 0
  }

  return NextResponse.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
      deleted: deletedUsers,
      candidates,
      recruiters,
      admins: adminsCount,
      moderators: moderatorsCount,
      roles: roleMap,
      todayNew,
      weekNew,
      monthNew,
      recentSignups: recentUsers,
      dailySignups,
    },
    jobs: { total: totalJobs, published: publishedJobs },
    applications: { total: totalApplications },
  })
}

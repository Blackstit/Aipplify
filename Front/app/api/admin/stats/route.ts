import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminFromRequest } from "@/lib/adminGuard"

function buildDailyMap(days: number, now: Date): Record<string, number> {
  const map: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    map[d.toISOString().slice(0, 10)] = 0
  }
  return map
}

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thirtyAgoStr = thirtyAgo.toISOString().slice(0, 10)
  const weekAgoStr = weekAgo.toISOString().slice(0, 10)

  // ── Users ──────────────────────────────────────────────────────────────────
  const [
    totalUsers, activeUsers, bannedUsers, deletedUsers,
    candidates, recruiters, adminsCount, moderatorsCount,
    usersTodayNew, usersWeekNew, usersMonthNew,
    totalApplications,
    recentUsers, roleBreakdown,
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
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, type: true, role: true, status: true, createdAt: true, emailVerified: true },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true, orderBy: { role: "asc" } }),
  ])

  // User daily signups (30 days)
  const usersLast30 = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyAgo } },
    select: { createdAt: true },
  })
  const userDailyMap = buildDailyMap(30, now)
  for (const u of usersLast30) {
    const key = u.createdAt.toISOString().slice(0, 10)
    if (key in userDailyMap) userDailyMap[key]++
  }
  const userDailySignups = Object.entries(userDailyMap).map(([date, count]) => ({ date, count }))

  const roleMap: Record<string, number> = {}
  for (const r of roleBreakdown) {
    const cnt = r._count
    roleMap[r.role] = typeof cnt === "object" && cnt ? (cnt._all ?? 0) : 0
  }

  // ── Jobs ───────────────────────────────────────────────────────────────────
  const [
    totalJobs, publishedJobs, draftJobs, archivedJobs,
    jobsTodayNew, jobsWeekNew, jobsMonthNew,
    remoteJobs, hybridJobs, officeJobs,
    jobsBySource, jobsByExperience,
  ] = await prisma.$transaction([
    prisma.job.count(),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.job.count({ where: { status: "ARCHIVED" } }),
    prisma.job.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.job.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.job.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.job.count({ where: { workType: "REMOTE" } }),
    prisma.job.count({ where: { workType: "HYBRID" } }),
    prisma.job.count({ where: { workType: "OFFICE" } }),
    prisma.job.groupBy({ by: ["source"], _count: true, orderBy: { source: "asc" } }),
    prisma.job.groupBy({ by: ["experience"], _count: true, orderBy: { experience: "asc" } }),
  ])

  // Jobs daily additions (30 days)
  const jobsLast30 = await prisma.job.findMany({
    where: { createdAt: { gte: thirtyAgo } },
    select: { createdAt: true },
  })
  const jobDailyMap = buildDailyMap(30, now)
  for (const j of jobsLast30) {
    const key = j.createdAt.toISOString().slice(0, 10)
    if (key in jobDailyMap) jobDailyMap[key]++
  }
  const jobDailyNew = Object.entries(jobDailyMap).map(([date, count]) => ({ date, count }))

  // Top companies by job count
  const topCompaniesRaw = await prisma.job.groupBy({
    by: ["companyId"],
    _count: { _all: true },
    orderBy: { _count: { companyId: "desc" } },
    take: 8,
    where: { companyId: { not: null } },
  })
  const topCompanyIds = topCompaniesRaw.map((r) => r.companyId).filter(Boolean) as string[]
  const topCompanyNames = await prisma.company.findMany({
    where: { id: { in: topCompanyIds } },
    select: { id: true, name: true },
  })
  const nameById: Record<string, string> = {}
  for (const c of topCompanyNames) nameById[c.id] = c.name
  const topCompanies = topCompaniesRaw.map((r) => ({
    name: r.companyId ? (nameById[r.companyId] ?? r.companyId) : "Unknown",
    count: r._count._all,
  }))

  const sourceMap: Record<string, number> = {}
  for (const r of jobsBySource) {
    const cnt = r._count
    sourceMap[r.source] = typeof cnt === "object" && cnt ? (cnt._all ?? 0) : 0
  }
  const expMap: Record<string, number> = {}
  for (const r of jobsByExperience) {
    const cnt = r._count
    expMap[r.experience] = typeof cnt === "object" && cnt ? (cnt._all ?? 0) : 0
  }

  // ── Visitors ───────────────────────────────────────────────────────────────
  const [viewsToday, viewsWeek, viewsMonth] = await prisma.$transaction([
    prisma.dailyPageView.aggregate({
      _sum: { views: true },
      where: { day: todayStr },
    }),
    prisma.dailyPageView.aggregate({
      _sum: { views: true },
      where: { day: { gte: weekAgoStr } },
    }),
    prisma.dailyPageView.aggregate({
      _sum: { views: true },
      where: { day: { gte: monthStart.toISOString().slice(0, 10) } },
    }),
  ])

  // 30-day page views chart
  const pvLast30 = await prisma.dailyPageView.findMany({
    where: { day: { gte: thirtyAgoStr } },
    select: { day: true, views: true },
  })
  const pvDailyMap = buildDailyMap(30, now)
  for (const pv of pvLast30) {
    if (pv.day in pvDailyMap) pvDailyMap[pv.day] += pv.views
  }
  const dailyViews = Object.entries(pvDailyMap).map(([day, views]) => ({ day, views }))

  // Top pages (last 30 days)
  const topPagesRaw = await prisma.dailyPageView.groupBy({
    by: ["path"],
    _sum: { views: true },
    where: { day: { gte: thirtyAgoStr } },
    orderBy: { _sum: { views: "desc" } },
    take: 10,
  })
  const topPages = topPagesRaw.map((r) => ({
    path: r.path,
    views: r._sum.views ?? 0,
  }))

  // 7-day unique days visited (simple activity indicator)
  const activeDays7 = await prisma.dailyPageView.groupBy({
    by: ["day"],
    where: { day: { gte: weekAgoStr } },
    _sum: { views: true },
  })

  // ── Response ───────────────────────────────────────────────────────────────
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
      todayNew: usersTodayNew,
      weekNew: usersWeekNew,
      monthNew: usersMonthNew,
      recentSignups: recentUsers,
      dailySignups: userDailySignups,
    },
    jobs: {
      total: totalJobs,
      published: publishedJobs,
      draft: draftJobs,
      archived: archivedJobs,
      todayNew: jobsTodayNew,
      weekNew: jobsWeekNew,
      monthNew: jobsMonthNew,
      byWorkType: { REMOTE: remoteJobs, HYBRID: hybridJobs, OFFICE: officeJobs },
      bySource: sourceMap,
      byExperience: expMap,
      dailyNew: jobDailyNew,
      topCompanies,
    },
    applications: { total: totalApplications },
    visitors: {
      todayViews: viewsToday._sum.views ?? 0,
      weekViews: viewsWeek._sum.views ?? 0,
      monthViews: viewsMonth._sum.views ?? 0,
      dailyViews,
      topPages,
      activeDays7: activeDays7.map((d) => ({ day: d.day, views: d._sum.views ?? 0 })),
    },
  })
}

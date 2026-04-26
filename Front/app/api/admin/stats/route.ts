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
  const sixtyAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
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
  ])

  // Jobs daily chart — by postedAt (the real publication date from the job-eco API).
  // Fixed 60-day window ending today; future-dated rows are clamped out via `lte: now`.
  const jobsLast60 = await prisma.job.findMany({
    where: { postedAt: { gte: sixtyAgo, lte: now } },
    select: { postedAt: true },
  })
  const jobDailyMap = buildDailyMap(60, now)
  for (const j of jobsLast60) {
    if (!j.postedAt) continue
    const key = j.postedAt.toISOString().slice(0, 10)
    if (key in jobDailyMap) jobDailyMap[key]++
  }
  const jobDailyNew = Object.entries(jobDailyMap).map(([date, count]) => ({ date, count }))

  // Meta for the header
  const latestPostedRow = await prisma.job.findFirst({
    where: { postedAt: { not: null } },
    orderBy: { postedAt: "desc" },
    select: { postedAt: true },
  })
  const latestPostedRaw = latestPostedRow?.postedAt ?? null

  // ── Visitors ───────────────────────────────────────────────────────────────
  const [
    visitorsTodayNew, visitorsWeekNew, visitorsMonthNew, totalVisitors,
    viewsToday, viewsWeek, viewsMonth,
  ] = await prisma.$transaction([
    prisma.visitor.count({ where: { firstSeen: { gte: todayStart } } }),
    prisma.visitor.count({ where: { firstSeen: { gte: weekAgo } } }),
    prisma.visitor.count({ where: { firstSeen: { gte: monthStart } } }),
    prisma.visitor.count(),
    prisma.dailyPageView.aggregate({ _sum: { views: true }, where: { day: todayStr } }),
    prisma.dailyPageView.aggregate({ _sum: { views: true }, where: { day: { gte: weekAgoStr } } }),
    prisma.dailyPageView.aggregate({ _sum: { views: true }, where: { day: { gte: monthStart.toISOString().slice(0, 10) } } }),
  ])

  // New visitors per day (30 days) — this is the chart the admin actually wants.
  const newVisitors30 = await prisma.visitor.findMany({
    where: { firstSeen: { gte: thirtyAgo } },
    select: { firstSeen: true },
  })
  const newVisMap = buildDailyMap(30, now)
  for (const v of newVisitors30) {
    const key = v.firstSeen.toISOString().slice(0, 10)
    if (key in newVisMap) newVisMap[key]++
  }
  const dailyNewVisitors = Object.entries(newVisMap).map(([day, count]) => ({ day, count }))

  // Top pages (last 30 days, by view count)
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

  // ── Match checks ──────────────────────────────────────────────────────────
  const [matchTotal, matchToday, matchWeek, matchMonth] = await Promise.all([
    prisma.matchCheckLog.count(),
    prisma.matchCheckLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.matchCheckLog.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.matchCheckLog.count({ where: { createdAt: { gte: monthStart } } }),
  ])

  const matchChecksLast30 = await prisma.matchCheckLog.findMany({
    where: { createdAt: { gte: thirtyAgo } },
    select: { createdAt: true },
  })
  const matchDailyMap = buildDailyMap(30, now)
  for (const m of matchChecksLast30) {
    const key = m.createdAt.toISOString().slice(0, 10)
    if (key in matchDailyMap) matchDailyMap[key]++
  }
  const dailyMatchChecks = Object.entries(matchDailyMap).map(([date, count]) => ({ date, count }))

  // ── Payments & subscriptions ───────────────────────────────────────────────
  const [paymentsTotal, paidCount, activeSubscriptions, revenueAgg, recentPaidPayments] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: { not: "FREE" } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ])

  // ── Applications funnel (conversions) ─────────────────────────────────────
  const [applicationsToday, applicationsWeek, applicationsMonth, jobViewSum] = await Promise.all([
    prisma.application.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.application.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.job.aggregate({ _sum: { viewCount: true } }),
  ])

  const applicationsLast30 = await prisma.application.findMany({
    where: { createdAt: { gte: thirtyAgo } },
    select: { createdAt: true },
  })
  const appDailyMap = buildDailyMap(30, now)
  for (const a of applicationsLast30) {
    const key = a.createdAt.toISOString().slice(0, 10)
    if (key in appDailyMap) appDailyMap[key]++
  }
  const dailyApplications = Object.entries(appDailyMap).map(([date, count]) => ({ date, count }))

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
      dailyNew: jobDailyNew,
      latestPostedAt: latestPostedRaw ?? null,
      totalJobViews: jobViewSum._sum.viewCount ?? 0,
    },
    applications: {
      total: totalApplications,
      todayNew: applicationsToday,
      weekNew: applicationsWeek,
      monthNew: applicationsMonth,
      dailyApplications,
    },
    matchChecks: {
      total: matchTotal,
      todayNew: matchToday,
      weekNew: matchWeek,
      monthNew: matchMonth,
      dailyMatchChecks,
    },
    payments: {
      total: paymentsTotal,
      paidCount,
      activeSubscriptions,
      totalRevenue: revenueAgg._sum.amount ?? 0,
      recentPaid: recentPaidPayments,
    },
    visitors: {
      totalEver: totalVisitors,
      todayNew: visitorsTodayNew,
      weekNew: visitorsWeekNew,
      monthNew: visitorsMonthNew,
      todayViews: viewsToday._sum.views ?? 0,
      weekViews: viewsWeek._sum.views ?? 0,
      monthViews: viewsMonth._sum.views ?? 0,
      dailyNewVisitors,
      topPages,
    },
  })
}

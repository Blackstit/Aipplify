#!/usr/bin/env tsx
import path from "path"
import dotenv from "dotenv"

const root = process.cwd()
dotenv.config({ path: path.resolve(root, ".env") })
dotenv.config({ path: path.resolve(root, ".env.local"), override: true })

async function main() {
  const { prisma } = await import("../lib/prisma")
  const r = await prisma.$executeRawUnsafe(`
    UPDATE "Job" j
    SET "applyCount" = COALESCE((
      SELECT COUNT(*)::int FROM "Application" a WHERE a."jobId" = j.id
    ), 0)
  `)
  console.log("Updated rows (driver-dependent number):", r)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

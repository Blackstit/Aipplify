#!/usr/bin/env tsx
/**
 * Разовая синхронизация вакансий из job-eco (тот же код, что в jobs:sync).
 */
import path from "path"
import dotenv from "dotenv"

const root = process.cwd()
dotenv.config({ path: path.resolve(root, ".env") })
dotenv.config({ path: path.resolve(root, ".env.local"), override: true })

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL не задан")
    process.exit(1)
  }
  const { syncAllJobEcoVacancies } = await import("../lib/parsers/job-eco")
  const r = await syncAllJobEcoVacancies()
  console.log(JSON.stringify(r, null, 2))
  if (r.errors.some((e) => e.includes("JOB_ECO_API_KEY"))) {
    process.exitCode = 0
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

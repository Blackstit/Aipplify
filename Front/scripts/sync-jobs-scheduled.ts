#!/usr/bin/env tsx
/**
 * Периодическая синхронизация вакансий (DegenCryptoJobs + CryptoJobsList RSS + job-eco API).
 * Вызывается из cron/systemd; подхватывает .env и .env.local из каталога Front.
 *
 * Переменные окружения (опционально):
 *   JOBS_SYNC_DEGEN_MAX_PAGES — сколько страниц Degen подтянуть за один запуск (по умолчанию 15)
 *   JOBS_SYNC_SKIP_CRYPTO=1   — не вызывать CryptoJobsList
 *   JOBS_SYNC_SKIP_JOB_ECO=1  — не вызывать job-eco (нужен JOB_ECO_API_KEY)
 */
import path from "path"
import dotenv from "dotenv"

const root = process.cwd()
dotenv.config({ path: path.resolve(root, ".env") })
dotenv.config({ path: path.resolve(root, ".env.local"), override: true })

function envInt(name: string, fallback: number): number {
  const v = process.env[name]
  if (!v) return fallback
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

async function main() {
  const degenMaxPages = envInt("JOBS_SYNC_DEGEN_MAX_PAGES", 15)
  const skipDegen = process.env.JOBS_SYNC_SKIP_DEGEN === "1"
  const skipCrypto = process.env.JOBS_SYNC_SKIP_CRYPTO === "1"
  const skipJobEco = process.env.JOBS_SYNC_SKIP_JOB_ECO === "1"

  const stamp = () => new Date().toISOString()
  console.log(
    `[jobs:sync] ${stamp()} start (Degen maxPages=${degenMaxPages}, skipDegen=${skipDegen}, skipCrypto=${skipCrypto}, skipJobEco=${skipJobEco})`,
  )

  if (!process.env.DATABASE_URL) {
    console.error("[jobs:sync] DATABASE_URL не задан. Проверьте Front/.env")
    process.exit(1)
  }

  if (!skipDegen) {
    try {
      const { parseAndSaveJobs: parseDegen } = await import("../lib/parsers/degencryptojobs")
      const degen = await parseDegen(1, degenMaxPages)
      console.log(`[jobs:sync] DegenCryptoJobs: saved=${degen.jobsSaved} updated=${degen.jobsUpdated} companies=${degen.companiesSaved} errors=${degen.errors.length}`)
      if (degen.errors.length) {
        degen.errors.slice(0, 5).forEach((e) => console.error(`  - ${e}`))
        if (degen.errors.length > 5) console.error(`  ... и ещё ${degen.errors.length - 5}`)
      }
    } catch (e) {
      console.error("[jobs:sync] Degen: фатальная ошибка:", e)
    }
  }

  if (!skipCrypto) {
    try {
      const { parseAndSaveJobs: parseCrypto } = await import("../lib/parsers/cryptojobslist")
      const crypto = await parseCrypto()
      console.log(
        `[jobs:sync] CryptoJobsList: saved=${crypto.jobsSaved} updated=${crypto.jobsUpdated} companies=${crypto.companiesSaved} errors=${crypto.errors.length}`,
      )
      if (crypto.errors.length) {
        crypto.errors.slice(0, 5).forEach((e) => console.error(`  - ${e}`))
      }
    } catch (e) {
      console.error("[jobs:sync] CryptoJobsList: фатальная ошибка:", e)
    }
  }

  if (!skipJobEco) {
    try {
      const { syncAllJobEcoVacancies } = await import("../lib/parsers/job-eco")
      const eco = await syncAllJobEcoVacancies()
      console.log(
        `[jobs:sync] job-eco: saved=${eco.jobsSaved} updated=${eco.jobsUpdated} companies=${eco.companiesSaved} pages=${eco.pagesFetched} errors=${eco.errors.length}`,
      )
      eco.errors.slice(0, 8).forEach((e) => console.error(`  - ${e}`))
      if (eco.errors.length > 8) console.error(`  ... и ещё ${eco.errors.length - 8}`)
    } catch (e) {
      console.error("[jobs:sync] job-eco: фатальная ошибка:", e)
    }
  }

  console.log(`[jobs:sync] ${stamp()} done`)
}

main().catch((e) => {
  console.error("[jobs:sync] fatal:", e)
  process.exit(1)
})

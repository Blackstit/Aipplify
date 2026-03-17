#!/usr/bin/env tsx
/**
 * Script to parse jobs from degencryptojobs.com API
 *
 * Usage:
 *   npm run parse:degen [-- --page=1 --maxPages=10]
 *   or
 *   tsx scripts/parse-degen-jobs.ts --page=1 --maxPages=10
 */

import path from "path"
import dotenv from "dotenv"
import { parseAndSaveJobs } from "../lib/parsers/degencryptojobs"

// Load env from .env.local in project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const args = process.argv.slice(2)

  let page = 1
  let maxPages: number | undefined = undefined

  for (const arg of args) {
    if (arg.startsWith("--page=")) {
      page = parseInt(arg.split("=")[1]) || 1
    } else if (arg.startsWith("--maxPages=")) {
      maxPages = parseInt(arg.split("=")[1])
    }
  }

  console.log(`🚀 Starting DegenCryptoJobs parser...`)
  console.log(`📄 Start page: ${page}`)
  console.log(`📚 Max pages: ${maxPages || "unlimited"}`)
  console.log("")

  try {
    const results = await parseAndSaveJobs(page, maxPages)

    console.log("")
    console.log("✅ Parsing completed!")
    console.log(`📊 Results:`)
    console.log(`   - Jobs saved: ${results.jobsSaved}`)
    console.log(`   - Jobs updated: ${results.jobsUpdated}`)
    console.log(`   - Companies saved: ${results.companiesSaved}`)
    console.log(`   - Errors: ${results.errors.length}`)

    if (results.errors.length > 0) {
      console.log("")
      console.log("❌ Errors:")
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

    process.exit(0)
  } catch (error) {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  }
}

main()

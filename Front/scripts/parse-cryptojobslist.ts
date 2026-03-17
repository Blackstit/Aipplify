#!/usr/bin/env tsx
/**
 * Script to parse jobs from cryptojobslist.com RSS feed
 *
 * Usage:
 *   npm run parse:cryptojobslist
 *   or
 *   tsx scripts/parse-cryptojobslist.ts
 */

import path from "path"
import dotenv from "dotenv"
import { parseAndSaveJobs } from "../lib/parsers/cryptojobslist"

// Load env from .env.local in project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  console.log(`🚀 Starting CryptoJobsList RSS parser...`)
  console.log("")

  try {
    const results = await parseAndSaveJobs()

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

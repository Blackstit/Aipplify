#!/usr/bin/env tsx
/**
 * Script to parse jobs from wantapply.com API
 * 
 * Usage:
 *   npm run parse:jobs [-- --page=1 --maxPages=5]
 *   or
 *   tsx scripts/parse-jobs.ts --page=1 --maxPages=5
 */

import path from "path"
import dotenv from "dotenv"
import { parseAndSaveJobs } from "../lib/parsers/wantapply"

// Load env from .env.local in project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const args = process.argv.slice(2)
  
  let page = 1
  let maxPages: number | undefined = undefined
  let authToken: string | undefined = process.env.WANTAPPLY_API_TOKEN
  let cookies: string | undefined = process.env.WANTAPPLY_COOKIES
  
  for (const arg of args) {
    if (arg.startsWith("--page=")) {
      page = parseInt(arg.split("=")[1]) || 1
    } else if (arg.startsWith("--maxPages=")) {
      maxPages = parseInt(arg.split("=")[1])
    } else if (arg.startsWith("--token=")) {
      authToken = arg.split("=")[1]
    } else if (arg.startsWith("--cookies=")) {
      cookies = arg.split("=")[1]
    }
  }
  
  if (!authToken) {
    console.error("❌ Error: WANTAPPLY_API_TOKEN not found!")
    console.error("   Set it in .env.local file or pass via --token=YOUR_TOKEN")
    process.exit(1)
  }
  
  if (!cookies) {
    console.error("❌ Error: WANTAPPLY_COOKIES not found!")
    console.error("   Set it in .env.local file or pass via --cookies=YOUR_COOKIES")
    console.error("   Copy cookies from browser DevTools -> Network -> Request Headers -> cookie")
    process.exit(1)
  }
  
  console.log(`🚀 Starting job parser...`)
  console.log(`📄 Page: ${page}`)
  console.log(`📚 Max pages: ${maxPages || "unlimited"}`)
  console.log(`🔑 Auth token: ${authToken ? `${authToken.substring(0, 30)}...` : "NOT SET"}`)
  console.log(`🍪 Cookies: ${cookies ? `${cookies.substring(0, 50)}...` : "NOT SET"}`)
  console.log("")
  
  try {
    const results = await parseAndSaveJobs(page, maxPages, authToken, cookies)
    
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

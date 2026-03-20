#!/usr/bin/env tsx
/**
 * Puppeteer-based parser that calls the WantApply API from a real Chromium.
 *
 * Usage:
 *   npm run parse:jobs:browser
 *   npm run parse:jobs:browser -- --page=1 --maxPages=5
 */

import path from "path"
import dotenv from "dotenv"
import puppeteer, { type Page } from "puppeteer"
import { saveJob } from "../lib/parsers/wantapply"

// Улучшенная функция для ожидания Cloudflare
async function waitForCloudflare(page: Page, maxWait = 30000) {
  const startTime = Date.now()
  while (Date.now() - startTime < maxWait) {
    const title = await page.title()
    const url = page.url()
    
    // Если страница загрузилась и это не Cloudflare challenge
    if (!title.includes("Cloudflare") && !title.includes("Attention Required") && !url.includes("challenge")) {
      return true
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

// Load env from .env.local in project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const args = process.argv.slice(2)

  let pageNum = 1
  let maxPages: number | undefined = undefined

  for (const arg of args) {
    if (arg.startsWith("--page=")) {
      pageNum = parseInt(arg.split("=")[1]) || 1
    } else if (arg.startsWith("--maxPages=")) {
      maxPages = parseInt(arg.split("=")[1])
    }
  }

  const authToken = process.env.WANTAPPLY_API_TOKEN
  const cookiesStr = process.env.WANTAPPLY_COOKIES

  if (!authToken) {
    console.error("❌ Error: WANTAPPLY_API_TOKEN not found in .env.local")
    process.exit(1)
  }

  if (!cookiesStr) {
    console.error("❌ Error: WANTAPPLY_COOKIES not found in .env.local")
    process.exit(1)
  }

  console.log("🚀 Starting Puppeteer job parser (browser-based)...")
  console.log(`📄 Start page: ${pageNum}`)
  console.log(`📚 Max pages: ${maxPages || "unlimited"}`)
  console.log(`🔑 Auth token (preview): ${authToken.substring(0, 30)}...`)
  console.log(`🍪 Cookies length: ${cookiesStr.length}`)
  console.log("")

  const browser = await puppeteer.launch({
    headless: true, // false — показать окно браузера
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    // Устанавливаем User-Agent как у реального браузера
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
    )

    // Сначала открываем главную страницу БЕЗ куков, чтобы Cloudflare проверил браузер
    console.log("🌐 Opening wantapply.com to pass Cloudflare check...")
    await page.goto("https://wantapply.com", {
      waitUntil: "networkidle0",
      timeout: 60000,
    })
    console.log("✅ Initial page load")

    // Ждём, пока Cloudflare пройдёт проверку
    console.log("⏳ Waiting for Cloudflare challenge to complete...")
    const cloudflarePassed = await waitForCloudflare(page, 30000)
    
    if (!cloudflarePassed) {
      console.warn("⚠️ Cloudflare challenge may still be active, but continuing...")
    } else {
      console.log("✅ Cloudflare check passed")
    }

    // Дополнительная пауза для стабильности
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Теперь устанавливаем куки ПОСЛЕ того, как страница загрузилась
    const cookiePairs = cookiesStr.split(";").map((c) => c.trim()).filter(Boolean)
    const cookies = cookiePairs.map((pair) => {
      const eqIndex = pair.indexOf("=")
      if (eqIndex === -1) return null
      const name = pair.substring(0, eqIndex)
      let value = pair.substring(eqIndex + 1)
      // Не декодируем, если это уже закодированное значение (например, в g_state или auth-token-data)
      // Декодируем только если это явно URL-encoded
      try {
        // Пробуем декодировать, если не получается - оставляем как есть
        const decoded = decodeURIComponent(value)
        // Если декодирование изменило значение и оно валидное - используем
        if (decoded !== value && !decoded.includes("%")) {
          value = decoded
        }
      } catch {
        // Оставляем как есть, если декодирование не удалось
      }
      return {
        name,
        value,
        domain: "wantapply.com",
        path: "/",
        httpOnly: name.includes("auth") || name.includes("AMP"),
        secure: true,
        sameSite: "Lax" as const,
      }
    }).filter((c): c is NonNullable<typeof c> => c !== null)

    await page.setCookie(...cookies)
    console.log(`✅ Set ${cookies.length} cookies for wantapply.com`)

    // Перезагружаем страницу с куками
    await page.reload({ waitUntil: "networkidle2" })
    console.log("✅ Page reloaded with cookies")

    // Устанавливаем заголовки для всех запросов
    await page.setExtraHTTPHeaders({
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://wantapply.com/",
      "Sec-CH-UA": '"Chromium";v="143", "Google Chrome";v="143", "Not-A.Brand";v="24"',
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"macOS"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    })

    let currentPage = pageNum
    let hasNextPage = true

    while (hasNextPage && (!maxPages || currentPage <= maxPages)) {
      console.log(`\n📄 Fetching page ${currentPage} via browser...`)

      const filters = { domain: "tech", search: "" }
      const filtersParam = encodeURIComponent(JSON.stringify(filters))
      const url = `https://wantapply.com/api/jobs?page=${currentPage}&filters=${filtersParam}`

      // Вызываем fetch внутри браузера с реалистичными заголовками
      const responseData: any = await page.evaluate(
        async (url, token) => {
          try {
            const res = await fetch(url, {
              method: "GET",
              headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                "referer": window.location.href,
                "sec-ch-ua": '"Chromium";v="143", "Google Chrome";v="143", "Not-A.Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
              },
              credentials: "include",
            })

            const text = await res.text()

            if (!res.ok) {
              return {
                ok: false,
                status: res.status,
                statusText: res.statusText,
                text: text.substring(0, 500),
              }
            }

            try {
              const json = JSON.parse(text)
              return {
                ok: true,
                json,
              }
            } catch (e) {
              return {
                ok: false,
                status: res.status,
                statusText: "Invalid JSON",
                text: text.substring(0, 500),
              }
            }
          } catch (e) {
            return {
              ok: false,
              status: 0,
              statusText: "Fetch error",
              text: String(e),
            }
          }
        },
        url,
        authToken,
      )

      if (!responseData || !responseData.ok) {
        const status = responseData?.status || "unknown"
        const statusText = responseData?.statusText || "unknown"
        const text = responseData?.text || "No response"
        console.error(
          `❌ Browser fetch failed: ${status} ${statusText} - ${text.substring(0, 200)}`,
        )
        // Если это 403, попробуем подождать и повторить
        if (status === 403) {
          console.log("⏳ Got 403, waiting 10 seconds and retrying...")
          await new Promise((resolve) => setTimeout(resolve, 10000))
          continue
        }
        break
      }

      const data = responseData.json as {
        data: any[]
        hasNextPage: boolean
        total: number
      }

      console.log(`✅ Got ${data.data.length} jobs on page ${currentPage}`)

      let jobsSaved = 0
      let jobsUpdated = 0

      for (const job of data.data) {
        try {
          // saveJob сам решает, создать или обновить вакансию
          await saveJob(job as any)
          jobsSaved++
        } catch (error) {
          console.error(
            `  ❌ Error saving job ${job.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
          jobsUpdated++ // считаем как "обновлённые/ошибочные"
        }
      }

      console.log(
        `📊 Page ${currentPage}: saved=${jobsSaved}, updated/failed=${jobsUpdated}`,
      )

      hasNextPage = data.hasNextPage
      currentPage++

      // Пауза, чтобы не триггерить rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log("\n✅ Puppeteer parsing finished.")
  } catch (error) {
    console.error("❌ Fatal error in Puppeteer parser:", error)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err)
  process.exit(1)
})


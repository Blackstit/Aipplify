from playwright.sync_api import sync_playwright
import json
import time


def collect_links(page):

    page.wait_for_selector("a[href*='-at-']", timeout=60000)

    links = page.evaluate("""
    () => Array.from(document.querySelectorAll("a"))
        .map(a => a.href)
        .filter(h => h.includes("-at-") && h.includes("wantapply.com"))
    """)

    links = list(set([l.split("?")[0] for l in links]))

    return links


def parse_job(page, url):

    page.goto(url, wait_until="domcontentloaded")
    time.sleep(2)

    data = page.evaluate("""
    () => {

        const title = document.querySelector("h1")?.innerText || null

        const company =
            document.querySelector("h2")?.innerText ||
            null

        const description =
            document.querySelector("article")?.innerText ||
            document.body.innerText

        return {
            title,
            company,
            description
        }

    }
    """)

    data["url"] = url

    return data


with sync_playwright() as p:

    browser = p.chromium.launch(
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )

    context = browser.new_context(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    )

    page = context.new_page()

    page.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    })
    """)

    print("Opening site...")

    page.goto("https://wantapply.com", wait_until="domcontentloaded")

    time.sleep(5)

    links = collect_links(page)

    print("Found jobs:", len(links))

    jobs = []

    for i, link in enumerate(links):

        print(f"Parsing {i+1}/{len(links)}")

        try:
            job = parse_job(page, link)
            jobs.append(job)
        except:
            print("Error:", link)

        time.sleep(1)

    browser.close()

    with open("jobs.json", "w") as f:
        json.dump(jobs, f, indent=2)


print("Saved jobs:", len(jobs))
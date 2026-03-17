import requests
import json
import time

BASE_URL = "https://degencryptojobs.com/api/jobs?page={}"

headers = {
    "accept": "*/*",
    "user-agent": "Mozilla/5.0"
}

all_jobs = []
page = 1

while True:
    print(f"Parsing page {page}...")

    url = BASE_URL.format(page)
    r = requests.get(url, headers=headers)

    if r.status_code != 200:
        print("Request failed:", r.status_code)
        break

    data = r.json()
    jobs = data.get("jobs", [])

    if not jobs:
        print("No more jobs")
        break

    for job in jobs:

        parsed_job = {
            "title": job.get("title"),
            "company": job.get("company"),
            "location": ", ".join(job.get("location", [])),
            "salary": job.get("salary"),
            "tags": job.get("tags"),
            "top_tags": job.get("topTags"),
            "description": job.get("description"),
            "date_posted": job.get("datePosted"),
            "apply_link": job.get("link"),
            "source": job.get("source"),
            "featured": job.get("featured")
        }

        all_jobs.append(parsed_job)

    page += 1
    time.sleep(1)

print("Total jobs:", len(all_jobs))

with open("jobs.json", "w", encoding="utf-8") as f:
    json.dump(all_jobs, f, indent=2, ensure_ascii=False)

print("Saved to jobs.json")
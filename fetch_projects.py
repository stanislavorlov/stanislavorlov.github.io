import urllib.request
import urllib.parse
import json
import os
import sys

USER = "stanislavorlov"
TOPIC = "portfolio"
MAX_PROJECTS = 6

# Words that should keep a specific casing when turning repo names into titles
SPECIAL_WORDS = {
    "ai": "AI", "api": "API", "phd": "PhD", "iot": "IoT", "ddd": "DDD",
    "grpc": "gRPC", "ml": "ML", "rl": "RL", "ui": "UI", "dotnet": ".NET",
}

query = f"user:{USER} topic:{TOPIC} fork:true"
url = "https://api.github.com/search/repositories?" + urllib.parse.urlencode({
    "q": query,
    "sort": "updated",
    "order": "desc",
    "per_page": MAX_PROJECTS,
})

headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": f"{USER}-portfolio",
}

# Use the Actions token when available to avoid the anonymous rate limit
token = os.environ.get("GITHUB_TOKEN")
if token:
    headers["Authorization"] = f"Bearer {token}"


def humanize(name):
    words = name.replace("_", "-").split("-")
    return " ".join(SPECIAL_WORDS.get(w.lower(), w.capitalize()) for w in words if w)


req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=15) as response:
        data = json.load(response)

    projects = []
    for repo in data.get("items", []):
        if repo.get("private") or repo.get("archived"):
            continue

        tags = [t for t in repo.get("topics", []) if t != TOPIC]
        if not tags and repo.get("language"):
            tags = [repo["language"]]

        projects.append({
            "title": humanize(repo["name"]),
            "description": (repo.get("description") or "").strip(),
            "url": repo["html_url"],
            "language": repo.get("language") or "",
            "tags": tags[:5],
            "stars": repo.get("stargazers_count", 0),
            "pushedAt": repo.get("pushed_at", ""),
        })

    # Save to static site root
    with open("projects.json", "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)

    print(f"Successfully fetched and saved {len(projects)} projects tagged '{TOPIC}'.")

except Exception as e:
    print(f"Error fetching projects: {e}", file=sys.stderr)
    sys.exit(1)

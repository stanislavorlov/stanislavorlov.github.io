import urllib.request
import xml.etree.ElementTree as ET
import json
import re
import sys

url = "https://stanislavorlov.hashnode.dev/rss.xml"

# The WAF bypass header is still required for RSS
headers = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=15) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    edges = []

    # Parse the first 3 <item> elements inside the <channel>
    for item in root.findall('./channel/item')[:3]:
        title = item.find('title').text.strip() if item.find('title') is not None and item.find('title').text else ""
        link = item.find('link').text.strip() if item.find('link') is not None and item.find('link').text else ""
        description = item.find('description').text.strip() if item.find('description') is not None and item.find('description').text else ""
        pubDate = item.find('pubDate').text.strip() if item.find('pubDate') is not None and item.find('pubDate').text else ""

        # Estimate reading time from full article content (average 200 words per minute)
        read_time = 5
        content_elem = item.find('{http://purl.org/rss/1.0/modules/content/}encoded')
        if content_elem is not None and content_elem.text:
            plain_text = re.sub(r'<[^>]+>', ' ', content_elem.text)
            words = len(plain_text.split())
            read_time = max(1, round(words / 200))

        # Clean whitespace from brief
        clean_brief = re.sub(r'\s+', ' ', description).strip()

        # Map to the object structure expected by the front-end
        node = {
            "title": title,
            "url": link,
            "brief": clean_brief,
            "publishedAt": pubDate,
            "readTimeInMinutes": read_time
        }
        
        edges.append({"node": node})

    # Save to static site root
    with open("latest-posts.json", "w", encoding="utf-8") as f:
        json.dump(edges, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully fetched and saved latest {len(edges)} posts from RSS.")

except Exception as e:
    print(f"Error fetching RSS: {e}", file=sys.stderr)
    sys.exit(1)
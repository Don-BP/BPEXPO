---
name: scraping-reddit
description: Fetches top posts from a specified subreddit using a Python script. Use when the user wants to get data, trends, or content from Reddit.
---

# Reddit Scraping Skill

## When to use this skill
- Scrape top posts from a subreddit
- Analyze trending topics on Reddit
- Fetch data for content aggregation
- "Get me the top posts from r/javascript"

## Workflow
1.  **Identify Subreddit**: Confirm the target subreddit with the user if not specified.
2.  **Run Scraper**: Execute the python script to fetch data.
3.  **Process Output**: Parse the JSON output and present it to the user or use it in subsequent steps.

## Instructions
This skill uses a Python script to interact with Reddit's public API (JSON endpoints). It handles `User-Agent` to avoid rate limits.

### Core Command
To fetch the top 3 posts:
```bash
python .agent/skills/scraping-reddit/scripts/fetch_posts.py [subreddit] --limit 3
```

To fetch N posts:
```bash
python .agent/skills/scraping-reddit/scripts/fetch_posts.py [subreddit] --limit [N]
```

### Parsing Output
The script outputs raw JSON. You should parse this JSON in your `run_command` output or using a subsequent Python script to format it nicely for the user.

## Resources
- [fetch_posts.py](scripts/fetch_posts.py)

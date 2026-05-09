import subprocess
import json
import os
import sys
from datetime import datetime

SUBREDDITS = [
    "gamedesign",
    "leveldesign",
    "TheMakingOfGames",
    "playmygame",
    "gameassets",
    "truegamedev",
    "gamejams",
    "devblogs"
]

SKILL_SCRIPT = os.path.join(".agent", "skills", "scraping-reddit", "scripts", "fetch_posts.py")
OUTPUT_FILE = "game_dev_helper.md"

def fetch_subreddit_posts(subreddit):
    """
    Calls the scraping-reddit skill script to get posts.
    """
    try:
        # Using sys.executable to ensure we use the same python interpreter
        result = subprocess.run(
            [sys.executable, SKILL_SCRIPT, subreddit, "--limit", "3"],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error scraping r/{subreddit}: {e.stderr}")
        return None
    except json.JSONDecodeError:
        print(f"Error parsing JSON for r/{subreddit}")
        return None

def generate_markdown(all_data):
    """
    Generates markdown content from the scraped data.
    """
    md = f"# Game Dev Helper\n\n"
    md += f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    for subreddit, posts in all_data.items():
        md += f"## r/{subreddit}\n\n"
        
        if not posts or 'data' not in posts or 'children' not in posts['data']:
             md += "_No posts found or error fetching data._\n\n"
             continue

        children = posts['data']['children']
        if not children:
            md += "_No top posts found._\n\n"
            continue

        for post in children:
            data = post['data']
            title = data.get('title', 'No Title')
            url = data.get('url', '#')
            score = data.get('score', 0)
            permalink = f"https://www.reddit.com{data.get('permalink', '')}"
            
            md += f"- **[{score}]** [{title}]({url})\n"
            md += f"  - [Comments]({permalink})\n"
        
        md += "\n"
    
    return md

def main():
    if not os.path.exists(SKILL_SCRIPT):
        print(f"Error: Skill script not found at {SKILL_SCRIPT}")
        sys.exit(1)

    all_data = {}
    print("Starting scrape...")
    
    for sub in SUBREDDITS:
        print(f"Fetching r/{sub}...")
        data = fetch_subreddit_posts(sub)
        if data:
            all_data[sub] = data
        else:
             all_data[sub] = None

    print("Generating markdown...")
    markdown_content = generate_markdown(all_data)
    
    # Append mode logic: If we wanted to strictly "add to", we'd read existing and append.
    # The requirement says "constantly add to as we gather more information", implies we might run this periodically.
    # For this initial creation, I will overwrite (or create new). 
    # If I run it again, I might want to append, but for a "helper doc" usually a refresh is better unless archiving.
    # I'll stick to overwriting for the 'current state' view, as top posts change. 
    # If the user wants a historical log, I'd structure it differently. 
    # For now, a fresh fresh snapshot is most useful.
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(markdown_content)
    
    print(f"Done! Written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

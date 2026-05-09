import requests
import argparse
import json
import sys

def fetch_top_posts(subreddit, limit=3):
    """
    Fetches the top N posts from a given subreddit as JSON.
    """
    url = f"https://www.reddit.com/r/{subreddit}/top.json?limit={limit}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch top posts from Reddit.")
    parser.add_argument("subreddit", help="Subreddit name")
    parser.add_argument("--limit", type=int, default=3, help="Number of posts")
    
    args = parser.parse_args()
    
    data = fetch_top_posts(args.subreddit, args.limit)
    if data:
        print(json.dumps(data, indent=2))

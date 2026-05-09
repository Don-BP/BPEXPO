import requests
import argparse
import sys
import json

def get_top_posts(subreddit, limit=3):
    """
    Fetches the top N posts from a given subreddit.
    """
    url = f"https://www.reddit.com/r/{subreddit}/top.json?limit={limit}"
    
    # User-Agent is critical to avoid 429 Too Many Requests
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if 'data' not in data or 'children' not in data['data']:
            print(f"Error: Unexpected JSON structure from Reddit API.")
            return

        posts = data['data']['children']
        
        if not posts:
            print(f"No posts found in r/{subreddit}.")
            return

        print(f"\n--- Top {len(posts)} Posts in r/{subreddit} ---\n")
        
        for i, post in enumerate(posts, 1):
            post_data = post['data']
            title = post_data.get('title', 'No Title')
            score = post_data.get('score', 0)
            author = post_data.get('author', 'Unknown')
            url = post_data.get('url', 'No URL')
            permalink = f"https://www.reddit.com{post_data.get('permalink', '')}"
            
            print(f"{i}. [{score}] {title}")
            print(f"   By: {author}")
            print(f"   Link: {url}")
            print(f"   Comments: {permalink}\n")

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
             print(f"Error: Subreddit 'r/{subreddit}' not found (404).")
        elif e.response.status_code == 429:
             print(f"Error: Too many requests (429). Please try again later.")
        else:
            print(f"HTTP Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"Network Error: {e}")
    except json.JSONDecodeError:
        print("Error: Failed to parse JSON response from Reddit.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape top posts from a Reddit subreddit.")
    parser.add_argument("subreddit", nargs="?", default="gamedev", help="The subreddit to scrape (default: gamedev)")
    parser.add_argument("--limit", type=int, default=3, help="Number of posts to retrieve (default: 3)")
    
    args = parser.parse_args()
    
    get_top_posts(args.subreddit, args.limit)

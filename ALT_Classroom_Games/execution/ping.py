import argparse
import sys
import time

def ping(url):
    print(f"Pinging {url}...")
    time.sleep(1) # Simulate work
    print(f"Success! {url} is reachable.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ping a website.")
    parser.add_argument("--url", required=True, help="The URL to ping")
    args = parser.parse_args()
    
    ping(args.url)

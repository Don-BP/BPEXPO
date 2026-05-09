# EXA + Firecrawl Setup Guide for Claude Code & Codex

**Give this file to your Claude Code or Codex agent and tell it: "Set up EXA and Firecrawl using this guide."**

> Your AI agent is only as good as the information it has. Without web search and scraping, it codes from memory — which means hallucinated APIs, outdated patterns, and guesswork. EXA gives your agent real-time web search. Firecrawl gives it the ability to read any website. Together, they eliminate hallucination.

---

## What You're Installing

| Tool | What It Does | How It Connects |
|------|-------------|-----------------|
| **EXA** | AI-native web search — semantic/neural search, code examples, company research, academic papers | MCP Server (HTTP) |
| **Firecrawl** | Web scraping, crawling, site mapping, autonomous research agent, cloud browser | CLI + Skill (Bash) |

**Why this combo works:**
- **EXA finds** the right sources (search)
- **Firecrawl reads** the full content from those sources (scrape)
- Together = your agent researches like a senior engineer instead of guessing

---

## Part 1: EXA MCP Setup

### Step 1: Get Your API Key (Optional — Free Tier Works Without It)

1. Go to https://dashboard.exa.ai/api-keys
2. Create a free account
3. Copy your API key (starts with `exa-...`)

> Free tier has no key requirement for basic usage. Add a key for higher rate limits.

### Step 2: Install EXA MCP on Claude Code (Global)

**Option A — One-line install (recommended):**
```bash
claude mcp add --transport http -s user exa https://mcp.exa.ai/mcp
```

**Option B — With API key for higher limits:**
```bash
claude mcp add --transport http -s user exa "https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_KEY"
```

**Option C — With ALL tools enabled + API key:**
```bash
claude mcp add --transport http -s user exa "https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_KEY&tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"
```

**Option D — Manual config (add to `~/.claude/settings.json`):**
```json
{
  "mcpServers": {
    "exa": {
      "url": "https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_KEY"
    }
  }
}
```

### Step 3: Install EXA MCP on Codex (Global)

Add to your `~/.codex/config.toml`:
```toml
[mcp_servers.exa]
type = "http"
url = "https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_KEY"
```

### Step 4: Verify EXA is Working

Restart Claude Code, then ask:
```
Search EXA for "React server components best practices 2025" and give me the top 3 results
```

If you get real search results with URLs, it's working.

### EXA Tools Available

| Tool | What It Does |
|------|-------------|
| `web_search_exa` | General web search with real-time results |
| `get_code_context_exa` | Code-specific search — GitHub, Stack Overflow, official docs |
| `company_research_exa` | Company funding, news, product announcements |
| `web_search_advanced_exa` | Advanced filtering, domain include/exclude |
| `crawling_exa` | Full webpage content retrieval |
| `people_search_exa` | LinkedIn/professional profile discovery |
| `deep_researcher_start` | Autonomous multi-step research agent |
| `deep_researcher_check` | Check status of deep research jobs |

---

## Part 2: Firecrawl CLI + Skill Setup

### Why CLI Instead of MCP?

The Firecrawl CLI is now the recommended approach over the MCP server:
- **Skill-based** — your agent learns HOW and WHEN to use it automatically
- **File-based output** — results save to disk, not flooding agent context
- **Agent command** — autonomous browsing without pre-defined URLs
- **Browser sessions** — cloud Chromium for complex scraping (login walls, JS-heavy sites)
- **Simpler setup** — one install command, globally available

### Step 1: Get Your Firecrawl API Key

1. Go to https://www.firecrawl.dev
2. Create an account (free tier available)
3. Copy your API key (starts with `fc-...`)

### Step 2: Install Firecrawl CLI + Skill (One Command)

This single command installs the CLI globally AND installs the Firecrawl skill to every detected AI coding agent on your machine:

```bash
npx -y firecrawl-cli@latest init --all --browser
```

**What `--all` does:** Installs the Firecrawl skill to Claude Code, Codex, OpenCode, and any other detected agent
**What `--browser` does:** Opens browser for authentication automatically

### Step 3: Set Your API Key

**Option A — Environment variable (recommended):**

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export FIRECRAWL_API_KEY=fc-YOUR-API-KEY
```

Then reload:
```bash
source ~/.zshrc
```

**Option B — Claude Code global env:**

Add to `~/.claude/settings.json` under `env`:
```json
{
  "env": {
    "FIRECRAWL_API_KEY": "fc-YOUR-API-KEY"
  }
}
```

**Option C — Codex global env:**

Add to `~/.codex/config.toml`:
```toml
[shell_environment_policy]
FIRECRAWL_API_KEY = { policy = "always_allow", value = "fc-YOUR-API-KEY" }
```

**Option D — CLI login:**
```bash
firecrawl login --browser
```

### Step 4: Add Bash Permission for Firecrawl

Your agent needs permission to run firecrawl commands. Add to your project's `.claude/settings.local.json` or global `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(firecrawl:*)"
    ]
  }
}
```

For Codex, firecrawl commands are available through the shell automatically.

### Step 5: Remove Firecrawl MCP (If Previously Installed)

If you had the Firecrawl MCP server configured, remove it to avoid conflicts:

```bash
claude mcp remove firecrawl -s user
```

Or manually remove the `firecrawl` entry from the `mcpServers` section in `~/.claude/settings.json`.

### Step 6: Verify Firecrawl is Working

Restart Claude Code, then:
```bash
firecrawl --status
```

You should see your API key, remaining credits, and CLI version.

Then ask your agent:
```
Use firecrawl to scrape https://firecrawl.dev and summarize what Firecrawl does
```

### Firecrawl CLI Commands

| Command | What It Does | Example |
|---------|-------------|---------|
| `firecrawl scrape <url>` | Get page content as markdown | `firecrawl scrape https://example.com` |
| `firecrawl search "query"` | Web search with optional scraping | `firecrawl search "React hooks" --limit 5` |
| `firecrawl map <url>` | Discover all URLs on a site | `firecrawl map https://docs.example.com` |
| `firecrawl crawl <url>` | Crawl entire site recursively | `firecrawl crawl https://example.com --wait` |
| `firecrawl agent "task"` | Autonomous research agent | `firecrawl agent "Find top 5 competitors" --wait` |
| `firecrawl browser launch-session` | Start cloud browser | Interactive Chromium session |
| `firecrawl browser execute` | Run code in browser | Python, JS, or Bash in sandbox |
| `firecrawl --status` | Check API key and credits | Verify setup |
| `firecrawl login --browser` | Authenticate | One-time setup |

---

## Part 3: How Your Agent Should Use Them

### Research Workflow

```
1. Agent needs info → EXA searches for it (finds the right sources)
2. Agent needs full content → Firecrawl scrapes it (reads the entire page)
3. Agent now has real, current context → builds with zero hallucination
```

### When to Use EXA

- "What's the latest way to do X?" — `web_search_exa`
- "Show me code examples for X" — `get_code_context_exa`
- "Research company X" — `company_research_exa`
- "Find academic papers on X" — `web_search_exa` with research paper category

### When to Use Firecrawl

- "Read this documentation page" — `firecrawl scrape <url>`
- "Get all pages from this docs site" — `firecrawl crawl <url>`
- "Find all URLs on this site" — `firecrawl map <url>`
- "Research this topic end-to-end" — `firecrawl agent "task"`
- "Scrape a page behind a login" — `firecrawl browser`

### When to Use Both Together

- Competitive analysis: EXA finds competitors → Firecrawl scrapes their sites
- Documentation ingestion: EXA finds the right docs → Firecrawl reads them fully
- Market research: EXA searches for data → Firecrawl extracts structured info
- Code patterns: EXA finds repos/examples → Firecrawl gets full source

---

## Quick Verification Checklist

After setup, run these to confirm everything works:

```bash
# Check EXA (in Claude Code)
# Ask: "Use EXA to search for 'Python async patterns 2025'"

# Check Firecrawl CLI
firecrawl --status

# Check Firecrawl scrape
firecrawl scrape https://example.com

# Check Firecrawl search
firecrawl search "test query" --limit 3
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| EXA not found | Restart Claude Code after adding MCP config |
| Firecrawl command not found | Run `npm install -g firecrawl-cli` |
| Firecrawl auth failed | Run `firecrawl login --browser` |
| Agent can't run firecrawl | Add `Bash(firecrawl:*)` to permissions |
| Rate limited on EXA | Add your API key to the MCP URL |
| Firecrawl MCP conflicts | Remove old MCP: `claude mcp remove firecrawl -s user` |

---

## Links

- **EXA Dashboard:** https://dashboard.exa.ai
- **EXA Docs:** https://exa.ai/docs
- **EXA MCP GitHub:** https://github.com/exa-labs/exa-mcp-server
- **Firecrawl Dashboard:** https://www.firecrawl.dev
- **Firecrawl CLI Docs:** https://docs.firecrawl.dev/cli
- **Firecrawl CLI GitHub:** https://github.com/firecrawl/cli
- **Firecrawl Skill (LobeHub):** https://lobehub.com/skills/firecrawl-cli-firecrawl-cli

---

*Made by the AI Architect Academy. Follow the journey at SigmaView.*

# Spark

*[Project description — update this section with your project's purpose and stack.]*

## Knowledge Base (read at session start)

At the start of every session, read [`knowledge/wiki/index.md`](knowledge/wiki/index.md) to load accumulated project knowledge. This wiki contains decisions, lessons, and patterns from past sessions — consulting it before diving into the codebase saves significant analysis time.

| Command | Purpose |
|---------|---------|
| Ask: "flush the knowledge base" | Process `CC-Session-Logs/` → structured wiki articles |
| Ask: "flush the inbox" | Process `knowledge/inbox/` raw files → structured wiki articles |
| Ask: "lint the wiki" | Health-check for orphan pages, contradictions, gaps |
| `python3 .claude/hooks/flush.py` | CLI: list unprocessed logs |
| `python3 .claude/hooks/flush.py --prompt` | CLI: print a ready-to-paste flush prompt |

Drop raw files (`.md`, `.txt`, PDFs, notes) into `knowledge/inbox/` and say "flush the inbox" to convert them into wiki articles.
Raw session logs auto-captured to `CC-Session-Logs/` via `Stop` and `PreCompact` hooks.
Full system schema: [`knowledge/agents.md`](knowledge/agents.md)

## Structure

```
*[Describe your project structure here.]*
```

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| *[Add decisions as they accumulate]* | — |

## Next Steps

- *[Add your current action items here]*

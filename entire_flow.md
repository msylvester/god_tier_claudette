````md
# Claude Code – Compounding Setup (Actionable Playbook)

This file is a **copy-paste, do-this-in-order setup** based on Boris Cherny’s workflow.  
Follow top to bottom. Commit what’s marked as shared.

---

## 1. Standardize the Model (One Model Everywhere)

**Goal:** Fewer retries, less steering.

- Use **Opus with thinking enabled** for:
  - Claude Code (local)
  - claude.ai/code (web)
- Do **not** switch models per task.

**Rule:** Consistency beats theoretical speed.

---

## 2. Run Multiple Claudes in Parallel

**Goal:** Never wait on one agent.

- Open **5–10 terminal tabs**
- Run Claude Code in each
- Name tabs: `C1`, `C2`, `C3`, etc.
- Use each Claude for a single purpose:
  - Refactor
  - Tests
  - Infra
  - Verification

**Rule:** Claudes are disposable.

---

## 3. Create and Share `CLAUDE.md` (Critical)

**Goal:** Persistent institutional memory.

1. Create `CLAUDE.md` at repo root
2. Check it into git
3. Start with:

```md
# Claude Code Rules

## Project Overview

- What this repo does
- Key constraints

## Hard Rules (Never Do)

- ❌ No new deps without approval
- ❌ No API changes without tests

## Code Style

- Formatting
- Error handling

## Common Mistakes to Avoid

- Past Claude failures + corrections

## How to Test

- Exact commands
```
````

**Rule:**
Every time Claude messes up → **update `CLAUDE.md`.**

---

## 4. Enforce `CLAUDE.md` in PRs (GitHub Action)

**Goal:** Claude improves its own rules.

- Install Claude Code GitHub Action
- In PRs, comment:

```text
@claude Please add a rule to CLAUDE.md that we should never mutate global config in tests.
```

- Treat `CLAUDE.md` changes as reviewable code.

---

## 5. Always Start Serious Work in Plan Mode

**Goal:** One-shot PRs.

- Enter **Plan Mode** (Shift + Tab twice)
- Prompt:

```text
Goal: Ship a PR that does X
Constraints: Y, Z
Produce a step-by-step plan. Do not write code yet.
```

- Iterate on the plan
- Switch to auto-accept edits
- Let Claude execute

**Rule:** No plan → no code.

---

## 6. Add Slash Commands for Inner Loops

**Goal:** Never repeat prompts.

1. Create directory:

```bash
mkdir -p .claude/commands
```

2. Example commands:

```md
# .claude/commands/add-tests.md

- Identify missing tests
- Add Vitest tests
- Do not modify prod code
```

```md
# .claude/commands/refactor.md

- Simplify code
- Preserve behavior
- No API changes
```

3. Use constantly:

```text
/add-tests
/refactor
```

---

## 7. Create Subagents for Repeated Work

**Goal:** Delegate thinking.

Common subagents:

- `code-simplifier`
- `verify-app`
- `infra-check`

**Rule:**
If you ask Claude the same thing 3× → make it a subagent.

---

## 8. Add PostToolUse Hook (Auto-Formatting)

**Goal:** Never fail CI on formatting.

1. Create hook:

```bash
mkdir -p .claude/hooks
touch .claude/hooks/post-tool-use.sh
chmod +x .claude/hooks/post-tool-use.sh
```

2. Script:

```bash
#!/usr/bin/env bash
set -e

if git diff --name-only | grep -E '\.(ts|tsx|js|jsx)$'; then
  bunx prettier --write .
  bunx eslint . --fix || true
fi
```

3. Register it:

```json
// .claude/settings.json
{
  "hooks": {
    "postToolUse": ".claude/hooks/post-tool-use.sh"
  }
}
```

---

## 9. Pre-Allow Safe Commands (No Dangerous Flags)

**Goal:** No permission prompts, no sandbox risk.

- Run:

```bash
/permissions
```

- Pre-allow:
  - git
  - bun / npm / node
  - docker / docker-compose
  - prettier / eslint
  - ls / cat / sed

- Share config:

```json
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "git",
      "bun",
      "npm",
      "node",
      "docker",
      "docker-compose",
      "prettier",
      "eslint",
      "ls",
      "cat"
    ]
  }
}
```

---

## 10. Share Tool Access via MCP

**Goal:** Claude behaves like a senior engineer.

1. Create `.mcp.json`:

```json
{
  "slack": {
    "tokenEnv": "SLACK_BOT_TOKEN",
    "channels": ["eng-alerts"]
  },
  "sentry": {
    "org": "your-org",
    "project": "api"
  },
  "bigquery": {
    "project": "analytics-prod"
  }
}
```

2. Check into git
3. Ensure env vars exist locally + CI

Claude can now:

- Query logs
- Post to Slack
- Run analytics

---

## 11. Long-Running Tasks (No Babysitting)

### Option A: Background verification

```text
After finishing, spawn a background agent to verify correctness.
```

### Option B: Stop hook

```json
{
  "hooks": {
    "onStop": "bun run test && bun run lint"
  }
}
```

### Option C: Sandbox mode (fire-and-forget)

```bash
claude --permission-mode=dontAsk
```

Use `--dangerously-skip-permissions` **only in sandbox**.

---

## 12. Operating Rule (Memorize This)

If you ever think:

> “Claude should always do X after Y”

→ Make it a **hook**, **command**, or **shared config**.

That’s the compounding advantage.

```

If you want, next I can:
- Turn this into a **repo-ready checklist**
- Generate a **baseline CLAUDE.md for your codebase**
- Suggest **high-ROI commands/hooks** for your services
```

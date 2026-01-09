---
description: Create commit, push to remote, and create a pull request
---

# Commit, Push, and Create PR

**Current Context:**

**Branch:** `{{bash: git branch --show-current}}`

**Remote Status:** `{{bash: git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "No upstream branch set"}}`

**Branch exists on remote:** `{{bash: git ls-remote --heads origin $(git branch --show-current) 2>/dev/null | grep -q . && echo "Yes" || echo "No"}}`

**Git Status:**
```
{{bash: git status --short}}
```

**Staged Changes:**
```
{{bash: git diff --cached --stat}}
```

**Unstaged Changes:**
```
{{bash: git diff --stat}}
```

**Recent Commits (for message style):**
```
{{bash: git log -5 --oneline --pretty=format:"%h %s"}}
```

**Detailed Diff of Staged Changes:**
```diff
{{bash: git diff --cached}}
```

**Detailed Diff of Unstaged Changes:**
```diff
{{bash: git diff}}
```

**All Untracked Files:**
```
{{bash: git ls-files --others --exclude-standard}}
```

---

## Your Task

Using the git context above:

1. **Analyze all changes** (both staged and unstaged) and determine what should be committed
2. **Stage any unstaged changes** that should be included (skip files that shouldn't be committed like .env, credentials, etc.)
3. **Create a commit** with a clear, concise message following the style of recent commits
   - Focus on the "why" not the "what"
   - Be specific about what changed and why
4. **Push to remote**:
   - If upstream branch exists: `git push`
   - If no upstream: `git push -u origin <branch-name>`
   - Use exponential backoff retry (2s, 4s, 8s, 16s) for network failures
5. **Create a Pull Request** using `gh pr create`:
   - Write a clear title summarizing the changes
   - Include a ## Summary section with 2-4 bullet points
   - Include a ## Test plan section with testing steps
   - Use the default base branch (main/master)

**Important:**
- DO NOT commit files with secrets (.env, credentials.json, etc.)
- Before running git commands, show me what you plan to do
- Follow the git safety protocol (no force push, no --no-verify, etc.)
- If there are no changes, tell me instead of creating an empty commit
- Return the PR URL when done

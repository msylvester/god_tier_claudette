#!/usr/bin/env bash
set -e

FILES=$(git diff --name-only --diff-filter=ACMRT)

# JS / TS formatting
if echo "$FILES" | grep -E '\.(ts|tsx|js|jsx)$'; then
  npx prettier --write .

  # Only run eslint if config exists
  if [ -f eslint.config.js ] || [ -f .eslintrc ] || [ -f .eslintrc.json ] || [ -f .eslintrc.js ]; then
    npx eslint . --fix || true
  fi
fi

# Markdown / JSON formatting
if echo "$FILES" | grep -E '\.(json|md)$'; then
  npx prettier --write .
fi


#!/usr/bin/env bash
set -e

FILES=$(git diff --name-only)

echo "$FILES" | grep -E '\.(ts|tsx|js|jsx)$' && \
  bunx prettier --write . && \
  bunx eslint . --fix || true

echo "$FILES" | grep -E '\.(json|md)$' && \
  bunx prettier --write .


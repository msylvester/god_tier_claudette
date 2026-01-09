# Development Workflow

**Always use `bun`, not `npm`.**

```sh
# 1. Make changes

# 2. Typecheck (fast)
bun run typecheck

# 3. Run tests
bun run test -- -t "test name"        # Single suite
bun run test:file -- "glob"            # Specific files

# 4. Lint before committing
bun run lint:file -- "file1.ts"        # Specific files
bun run lint                           # All files

# 5. Before creating PR
bun run lint:claude && bun run test
```

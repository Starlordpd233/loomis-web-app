---
description: How to sync tracked files between worktrees
---

# Sync Worktrees Workflow

This workflow ensures tracked files stay in sync between the `main` and `solve-incompatibility` worktrees.

## Worktree Locations

| Branch | Path |
|--------|------|
| `main` | `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc` |
| `solve-incompatibility` | `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility` |

## Syncing from main → solve-incompatibility

When you've made changes on `main` that should be synced to `solve-incompatibility`:

// turbo
1. Navigate to the solve-incompatibility worktree:
```bash
cd "/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility"
```

// turbo
2. Merge main into solve-incompatibility:
```bash
git merge main -m "Merge main: <brief description of changes>"
```

3. Resolve any conflicts if they arise, then commit.

## Syncing from solve-incompatibility → main

When you've made changes on `solve-incompatibility` that should go to `main`:

// turbo
1. Navigate to the main worktree:
```bash
cd "/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc"
```

// turbo
2. Merge solve-incompatibility into main:
```bash
git merge solve-incompatibility -m "Merge solve-incompatibility: <brief description>"
```

3. Resolve any conflicts if they arise, then commit.

## Quick Sync Check

To verify both worktrees have matching `.gitignore`:

// turbo
```bash
diff "/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/.gitignore" "/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/.gitignore"
```

## Files That Should Stay in Sync

- `.gitignore` — Must match across both worktrees
- `planning/` — Migration planning docs
- `to_do/` — Task tracking files

## Notes

- Always commit changes on both branches before syncing
- The canonical `.gitignore` lives on `main`
- Visual baseline screenshots (`**/visual-baseline/**/*.png`) are ignored and won't sync

#!/usr/bin/env bash
# Push only packages/sdk history to a separate remote (e.g. public open-source repo).
# Run from monorepo root, or: pnpm run push:public (from packages/sdk).
#
# Usage:
#   ./packages/sdk/scripts/push-to-public-remote.sh [remote_name] [target_branch]
# Defaults: remote_name=public, target_branch=main
#
# Requires: git subtree (built into Git). First run may take a while on large repos.

set -euo pipefail

REMOTE="${1:-public}"
TARGET_BRANCH="${2:-main}"
PREFIX="packages/sdk"
SPLIT_BRANCH="sdk-subtree-split-$(date +%s)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

if ! git remote get-url "$REMOTE" &>/dev/null; then
  echo "Error: git remote '$REMOTE' is not configured."
  echo "Add it with: git remote add $REMOTE git@github.com:ORG/REPO.git"
  exit 1
fi

echo "Splitting subtree prefix=$PREFIX -> branch $SPLIT_BRANCH ..."
git subtree split --prefix="$PREFIX" -b "$SPLIT_BRANCH"

echo "Pushing to $REMOTE $TARGET_BRANCH (this updates the public repo root to match packages/sdk/) ..."
if git push "$REMOTE" "$SPLIT_BRANCH:$TARGET_BRANCH" --force-with-lease; then
  echo "Done."
else
  echo "If the remote branch is empty or you need to overwrite, retry with:"
  echo "  git push $REMOTE $SPLIT_BRANCH:$TARGET_BRANCH --force"
  git branch -D "$SPLIT_BRANCH" 2>/dev/null || true
  exit 1
fi

git branch -D "$SPLIT_BRANCH"
echo "Removed local split branch $SPLIT_BRANCH"

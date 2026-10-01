#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 ]] || { echo "usage: bin/land.sh <sha>   (LAND_REMOTE defaults to origin)" >&2; exit 2; }
remote="${LAND_REMOTE:-origin}"
sha="$(git rev-parse --verify "${1}^{commit}")"

git fetch --quiet "${remote}" main
if ! git merge-base --is-ancestor "${remote}/main" "${sha}"; then
  echo "refused: ${sha} is not a fast-forward of ${remote}/main ($(git rev-parse --short "${remote}/main"))" >&2
  exit 1
fi

git push --quiet "${remote}" "${sha}:refs/heads/main"
main_tree="$(git worktree list --porcelain | awk '/^worktree /{dir=$2} /^branch refs\/heads\/main$/{print dir}')"
if [[ -n "${main_tree}" ]] && ! git -C "${main_tree}" merge --quiet --ff-only "${sha}"; then
  echo "pushed, but local main in ${main_tree} didn't fast-forward; run: git -C '${main_tree}' merge --ff-only ${sha}" >&2
fi
echo "landed $(git log -1 --format='%h %s' "${sha}") on ${remote}/main"

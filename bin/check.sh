#!/usr/bin/env bash
set -euo pipefail
for step in test typecheck build; do
  output=$(npm run --silent "$step" 2>&1) || {
    echo "$output"
    exit 1
  }
done
if grep -rqF "It has now been over ten year since the publication" dist; then
  echo "The DDD Reference text reached the client bundle (dist/). Keep it server-side."
  exit 1
fi

#!/usr/bin/env bash
set -euo pipefail
for step in test typecheck build; do
  output=$(npm run --silent "$step" 2>&1) || {
    echo "$output"
    exit 1
  }
done

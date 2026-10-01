#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 ]] || { echo "usage: bin/hosted-check.sh <site url, e.g. https://ddd-coach.netlify.app>" >&2; exit 2; }
site="${1%/}"
failed=0

check() {
  if eval "$2"; then echo "PASS  $1"; else echo "FAIL  $1"; failed=1; fi
}

status_of() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

headers="$(curl -sI "${site}/")"
html="$(curl -s "${site}/")"
assets="$({ grep -oE '(src|href)="/assets/[^"]+\.(js|css)"' <<<"${html}" || true; } | sed -E 's/^(src|href)="//; s/"$//' | sort -u)"
bundle="${html}"
for asset in ${assets}; do bundle+="$(curl -s "${site}${asset}")"; done
fonts="$({ grep -oE 'url\([^)]*\.woff2[^)]*\)' <<<"${bundle}" || true; } | sed -E 's/^url\(["'"'"']?//; s/["'"'"']?\)$//' | sort -u)"

check "X-Content-Type-Options: nosniff" 'grep -qi "^x-content-type-options: *nosniff" <<<"${headers}"'
check "Referrer-Policy: strict-origin-when-cross-origin" 'grep -qi "^referrer-policy: *strict-origin-when-cross-origin" <<<"${headers}"'
check "CSP frame-ancestors 'none'" 'grep -qi "^content-security-policy:.*frame-ancestors '"'"'none'"'"'" <<<"${headers}"'
check "/api/health is 200 with status ok" '[[ "$(status_of "${site}/api/health")" == 200 ]] && curl -s "${site}/api/health" | grep -q "\"status\":\"ok\""'
check "/api/chat GET is 405" '[[ "$(status_of "${site}/api/chat")" == 405 ]]'
check "/api/chat POST without a session is 401" '[[ "$(status_of -X POST -H "Content-Type: application/json" -d "{}" "${site}/api/chat")" == 401 ]]'
check "bundle found ($(wc -w <<<"${assets}" | tr -d " ") assets)" '[[ -n "${assets}" ]]'
check "no sk-or or OPENROUTER in the HTML, JS and CSS" '! grep -qE "sk-or|OPENROUTER" <<<"${bundle}"'
check "no source maps" '! grep -q "sourceMappingURL" <<<"${bundle}"'
check "no googleapis or gstatic references" '! grep -qE "googleapis|gstatic" <<<"${bundle}"'
check "every font is same-origin ($(wc -w <<<"${fonts}" | tr -d " ") woff2)" '[[ -n "${fonts}" ]] && ! grep -qE "^(https?:)?//" <<<"${fonts}"'
for font in ${fonts}; do
  check "font ${font} is 200" '[[ "$(status_of "${site}${font}")" == 200 ]]'
done

exit "${failed}"

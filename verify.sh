#!/usr/bin/env bash
set -euo pipefail

# Sends a minimal OTLP trace span via HTTP to the collector, then checks
# the collector's logs to confirm it was received and logged.

cd "$(dirname "${BASH_SOURCE[0]}")"

COLLECTOR_URL="${COLLECTOR_URL:-http://localhost:4318/v1/traces}"
TRACE_ID=$(openssl rand -hex 16)
SPAN_ID=$(openssl rand -hex 8)
MARKER="verify-otel-$RANDOM"
START_NS="$(date +%s)000000000"
END_NS="$(( $(date +%s) + 1 ))000000000"

echo "Sending test trace with marker: $MARKER"

curl -sS -X POST "$COLLECTOR_URL" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "resourceSpans": [{
    "resource": {
      "attributes": [{
        "key": "test.marker",
        "value": { "stringValue": "$MARKER" }
      }]
    },
    "scopeSpans": [{
      "spans": [{
        "traceId": "$TRACE_ID",
        "spanId": "$SPAN_ID",
        "name": "verify-span",
        "kind": 1,
        "startTimeUnixNano": "$START_NS",
        "endTimeUnixNano": "$END_NS"
      }]
    }]
  }]
}
EOF

echo
echo "Checking collector logs for marker..."

for i in $(seq 1 10); do
  if docker compose logs otel-collector 2>/dev/null | grep -q "$MARKER"; then
    echo "SUCCESS: collector received and logged the test span ($MARKER)"
    exit 0
  fi
  sleep 1
done

echo "FAILED: marker not found in collector logs"
exit 1

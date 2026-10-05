---
name: query-newrelic
description: Query New Relic telemetry data (Traces, Metrics, Logs) using the New Relic CLI with NRQL.
---

# Query New Relic Skill

Use this skill when you need to query OpenTelemetry (OTel) data—such as traces, metrics, and logs—from New Relic using the New Relic CLI with NRQL commands.

## Prerequisites
- New Relic CLI installed (`newrelic`)
- Valid New Relic profile configured with your account ID and API keys.

## Common Operations

### 1. Query Logs (NRQL)
Query ingested log data using the New Relic CLI NRQL command:
```bash
newrelic nrql query --query "SELECT timestamp, message, service.name FROM Log WHERE service.name = 'your-service' LIMIT 20"


Use the NewRelic CLI
```sh
newrelic nrql query --query "SELECT * FROM XXX"
```

```sh
FROM Log
SELECT *
```
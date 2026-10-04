# claude-otel

A basic OpenTelemetry Collector setup that receives OTLP traces/metrics/logs,
logs everything it receives locally, and forwards it to New Relic.

## New Relic service name

All telemetry exported to New Relic is reported under the service name:

```
claude-otel-collector-demo
```

This name is enforced by the `resource` processor in
`otel-collector-config.yaml`, which overwrites the `service.name` resource
attribute on every signal with the value of the `OTEL_SERVICE_NAME` env var
(set in `.env`). This guarantees a stable, consistent service name in New
Relic no matter what `service.name` an individual client sends, and no
matter how many times the collector is restarted.

To use a different name, change `OTEL_SERVICE_NAME` in `.env` and restart
the collector.

## Setup

1. Copy your New Relic license key and endpoint into `.env`:

   ```
   export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp.nr-data.net:4317"
   export OTEL_EXPORTER_OTLP_HEADERS="api-key=<YOUR_NEW_RELIC_LICENSE_KEY>"
   export NEW_RELIC_API_KEY="<YOUR_NEW_RELIC_LICENSE_KEY>"
   export OTEL_SERVICE_NAME="claude-otel-collector-demo"
   ```

   `.env` is gitignored — never commit it.

2. Start the collector:

   ```
   docker compose up -d
   ```

## Verifying it's working

Run the verification script. It sends a test OTLP trace to the collector
over HTTP and checks the collector's own logs to confirm it was received:

```
./verify.sh
```

On success you'll see the span logged by the collector's `debug` exporter,
and it will also have been forwarded to New Relic under the
`claude-otel-collector-demo` service name.

## Files

- `docker-compose.yml` — runs the `otel/opentelemetry-collector` image,
  exposing OTLP gRPC (4317) and OTLP HTTP (4318), and loads `.env`.
- `otel-collector-config.yaml` — OTLP receiver → `resource` processor
  (pins `service.name`) → `debug` + New Relic OTLP exporters.
- `.env` — New Relic endpoint, API key, and service name (not committed).
- `verify.sh` — sends a test trace and confirms the collector logged it.

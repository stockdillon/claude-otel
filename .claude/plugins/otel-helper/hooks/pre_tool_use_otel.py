#!/usr/bin/env python3
"""PreToolUse hook: export an OTEL log event with custom metadata via OTLP/HTTP JSON."""
import json
import os
import sys
import time
import urllib.request

CUSTOM_METADATA = {"myProp1": "myValue1", "myProp2": "myValue2"}

ENDPOINT = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318").rstrip("/")


def attr(key, value):
    return {"key": key, "value": {"stringValue": str(value)}}


def main():
    try:
        event = json.load(sys.stdin)
    except Exception:
        event = {}

    attributes = [
        attr("event.name", "claude_code.pre_tool_use"),
        attr("tool_name", event.get("tool_name", "")),
        attr("session_id", event.get("session_id", "")),
        *(attr(k, v) for k, v in CUSTOM_METADATA.items()),
    ]

    payload = {
        "resourceLogs": [{
            "resource": {"attributes": [attr("service.name", "claude-code-otel-helper")]},
            "scopeLogs": [{
                "scope": {"name": "otel-helper.hooks"},
                "logRecords": [{
                    "timeUnixNano": str(time.time_ns()),
                    "severityNumber": 9,
                    "severityText": "INFO",
                    "body": {"stringValue": "PreToolUse"},
                    "attributes": attributes,
                }],
            }],
        }]
    }

    req = urllib.request.Request(
        f"{ENDPOINT}/v1/logs",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=2).read()
    except Exception as e:
        print(f"otel-helper: log export failed: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
    sys.exit(0)  # never block the tool call

# OTel Helper Plugin

A Claude Code plugin for OpenTelemetry and NewRelic integration helpers.

## Structure

```
otel-helper/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── hooks/
│   ├── hooks.json           # Hook module configuration
│   └── register.tsx         # Main plugin code with hooks
└── README.md                # This file
```

## Development

To develop this plugin locally:

1. Edit the `hooks/register.tsx` file to add or modify hooks
2. The plugin will hot-reload when you save changes (if enabled)
3. Check types with: `tsc -p .`
4. Validate the plugin with: `claude plugin validate .`

## Available Hooks

- `session.start` - Initialize plugin on session start
- `command.run` - Handle `/nr-query` command
- `tool.call` - Monitor and react to tool calls (e.g., NewRelic CLI commands)

## Next Steps

- [ ] Add pane for NewRelic query results
- [ ] Add types/index.d.ts for state management
- [ ] Add tests with plugin test suite

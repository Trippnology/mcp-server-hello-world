# MCP Server Hello World

A lightweight NodeJS implementation of a Model Context Protocol (MCP) Hello World server for testing and development purposes.

Inspired by [mcp-hello-world](https://github.com/lobehub/mcp-hello-world/), but much more lightweight (~17MB vs 1GB+).

## Installation

### As Development Dependency (Recommended)

```bash
npm install --save-dev @trippnology/mcp-server-hello-world
```

### Global Installation

```bash
npm install -g @trippnology/mcp-server-hello-world
```

## Quick Start

### Using npx (Easiest)

```bash
# STDIO mode (default)
npx @trippnology/mcp-server-hello-world

# HTTP/SSE mode
npx @trippnology/mcp-server-hello-world --mode http --port 3000
```

### As Dev Dependency

```bash
# Via package.json scripts
npm run mcp:stdio
npm run mcp:http

# Or directly
./node_modules/.bin/mcp-hello-world --mode stdio
./node_modules/.bin/mcp-hello-world --mode http --port 8080
```

### Global Installation

```bash
mcp-hello-world --mode stdio
mcp-hello-world --mode http --port 3000
```

### CLI Options

- `--mode <stdio|http>` - Communication mode (default: stdio)
- `--port <number>` - HTTP server port (default: 3000)
- `--host <string>` - HTTP server host (default: localhost)
- `--verbose` - Enable verbose logging
- `--version` - Show version
- `--help` - Show help

### Package.json Integration

Add these scripts to your `package.json` for easy testing:

````json
{
  "scripts": {
    "mcp:stdio": "mcp-hello-world --mode stdio",
    "mcp:http": "mcp-hello-world --mode http --port 3001"
  }
}

## Features

**Complete MCP Protocol Support** with resources, tools, and prompts:

- **Resources**: Static and dynamic data sources
  - `hello://world` - Returns "Hello World!"
  - `greeting://{name}` - Returns personalized greeting

- **Tools**: Invokable functions
  - `echo` - Echoes input with "Hello " prefix
  - `debug` - Lists all available MCP capabilities

- **Prompts**: Predefined conversation templates
  - `helpful-assistant` - Basic assistant prompt

**Communication Modes**:
- **STDIO**: Direct process communication for MCP clients
- **HTTP/SSE**: REST endpoints with Server-Sent Events (starts at `http://localhost:3000`)
  - `/health` - Health check endpoint
  - `/messages` - HTTP POST endpoint for MCP messages
  - `/sse` - Server-Sent Events endpoint

## Testing

```bash
npm test
````

## Documentation

For detailed API documentation, request/response examples, and implementation details, see [API.md](API.md).

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature develop`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT

Copyright (c) 2025 Rikki Tripp - [Trippnology](https://trippnology.com)

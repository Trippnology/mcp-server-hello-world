# MCP Server Hello World

A lightweight NodeJS implementation of a Model Context Protocol (MCP) Hello World server for testing and development purposes.

Inspired by [mcp-hello-world](https://github.com/lobehub/mcp-hello-world/), but much more lightweight (~17MB vs 1GB+).

## Installation

```bash
npm install @trippnology/mcp-server-hello-world
```

## Quick Start

### STDIO Mode (Default)

```bash
node stdio-server.js
```

### HTTP/SSE Mode

```bash
node http-server.js
```

Server starts at `http://localhost:3000` with endpoints: `/health`, `/messages`, `/sse`

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

- **STDIO**: Direct process communication
- **HTTP/SSE**: REST endpoints with Server-Sent Events using Hapi.js

## Testing

```bash
npm test
```

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

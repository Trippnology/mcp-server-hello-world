# MCP Server Hello World

A NodeJS implementation of a Model Context Protocol (MCP) Hello World server, primarily intended for testing and development purposes.

Inspired by [mcp-hello-world](https://github.com/lobehub/mcp-hello-world/), but that installs over 1GB of react crap, so this is a lot more lightweight (around 17MB).

## Features

- **Complete MCP Protocol Support**: Resources, tools, and prompts
- **STDIO Mode**: Standard input/output communication for direct process integration
- **HTTP/SSE Mode**: HTTP server with Server-Sent Events support using Hapi.js
- **Test Suite**: Comprehensive tests using Mocha and Chai

## Installation

```bash
npm install @trippnology/mcp-server-hello-world
```

## Usage

### STDIO Mode (Default)

Run the server in STDIO mode for direct process communication:

```bash
node stdio-server.js
```

### HTTP/SSE Mode

Run the HTTP server with Server-Sent Events support:

```bash
node http-server.js
```

The HTTP server will start on `http://localhost:3000` with the following endpoints:

- `/health` - Health check endpoint
- `/messages` - HTTP POST endpoint for MCP messages
- `/sse` - Server-Sent Events endpoint

## Testing

Run the complete test suite:

```bash
npm test
```

## MCP Capabilities

### Resources

- **`hello://world`**: Static Hello World resource

    - Returns: `{ data: 'Hello World!' }`

- **`greeting://{name}`**: Dynamic greeting resource
    - Example: `greeting://Alice` returns `{ data: 'Hello Alice!' }`

### Tools

- **`echo`**: Echoes input message with "Hello " prefix

    - Parameters: `{ message: string }`
    - Returns: `{ content: [{ type: 'text', text: 'Hello {message}' }] }`

- **`debug`**: Lists all available MCP capabilities
    - Parameters: `{}`
    - Returns: JSON structure with resources, tools, and prompts

### Prompts

- **`helpful-assistant`**: Basic assistant prompt

    - Returns: Predefined system and user messages

# API Reference

## MCP Protocol Methods

All requests follow the JSON-RPC 2.0 specification with the following structure:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "method_name",
  "params": { ... }
}
```

All responses follow this structure:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { ... }
}
```

Error responses use this structure:

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"error": {
		"code": -32601,
		"message": "Method not found"
	}
}
```

### Server Initialization

#### `initialize`

Initialize the MCP server and get its capabilities.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "initialize",
	"params": {}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"protocolVersion": "2024-11-05",
		"capabilities": {
			"resources": {
				"subscribe": false,
				"listChanged": false
			},
			"tools": {
				"listChanged": false
			},
			"prompts": {
				"listChanged": false
			}
		},
		"serverInfo": {
			"name": "mcp-hello-world-nodejs",
			"version": "1.0.0"
		}
	}
}
```

## Resources

Resources are data sources that can be retrieved by the MCP client.

#### `resources/list`

List all available resources.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "resources/list",
	"params": {}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"resources": [
			{
				"uri": "hello://world",
				"name": "Hello World",
				"description": "A static Hello World resource"
			}
		]
	}
}
```

#### `resources/get`

Retrieve a specific resource by URI.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "resources/get",
	"params": {
		"uri": "hello://world"
	}
}
```

**Response for static resource:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"data": "Hello World!"
	}
}
```

**Request for dynamic greeting resource:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "resources/get",
	"params": {
		"uri": "greeting://Alice"
	}
}
```

**Response for dynamic resource:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"data": "Hello Alice!"
	}
}
```

**Available Resource URIs:**

- `hello://world` - Static Hello World message
- `greeting://{name}` - Dynamic greeting with any name

## Tools

Tools are functions that can be invoked by the MCP client.

#### `tools/list`

List all available tools.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/list",
	"params": {}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"tools": [
			{
				"name": "echo",
				"description": "Echoes the input message, prefixed with \"Hello \"",
				"inputSchema": {
					"type": "object",
					"properties": {
						"message": {
							"type": "string"
						}
					},
					"required": ["message"]
				}
			},
			{
				"name": "debug",
				"description": "Lists all available MCP method definitions on the server",
				"inputSchema": {
					"type": "object",
					"properties": {}
				}
			}
		]
	}
}
```

#### `tools/invoke`

Invoke a specific tool with parameters.

**Request for echo tool:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/invoke",
	"params": {
		"name": "echo",
		"parameters": {
			"message": "World"
		}
	}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"content": [
			{
				"type": "text",
				"text": "Hello World"
			}
		]
	}
}
```

**Request for debug tool:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/invoke",
	"params": {
		"name": "debug",
		"parameters": {}
	}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"content": [
			{
				"type": "text",
				"text": "{\n  \"resources\": [\"hello://world\"],\n  \"tools\": [\n    {\n      \"name\": \"echo\",\n      \"description\": \"Echoes the input message, prefixed with \\\"Hello \\\"\"\n    },\n    {\n      \"name\": \"debug\",\n      \"description\": \"Lists all available MCP method definitions on the server\"\n    }\n  ],\n  \"prompts\": [\n    {\n      \"name\": \"helpful-assistant\",\n      \"description\": \"A basic assistant prompt definition\"\n    }\n  ]\n}"
			}
		]
	}
}
```

## Prompts

Prompts are predefined conversation templates.

#### `prompts/list`

List all available prompts.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "prompts/list",
	"params": {}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"prompts": [
			{
				"name": "helpful-assistant",
				"description": "A basic assistant prompt definition"
			}
		]
	}
}
```

#### `prompts/get`

Retrieve a specific prompt by name.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "prompts/get",
	"params": {
		"name": "helpful-assistant"
	}
}
```

**Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"messages": [
			{
				"role": "system",
				"content": {
					"type": "text",
					"text": "You are a helpful assistant."
				}
			},
			{
				"role": "user",
				"content": {
					"type": "text",
					"text": "How can I help you today?"
				}
			}
		]
	}
}
```

## HTTP Server Endpoints

When running in HTTP mode (`node http-server.js`), the server provides these REST endpoints:

### `GET /health`

Health check endpoint.

**Response:**

```json
{
	"status": "ok",
	"timestamp": "2025-01-15T10:30:00.000Z"
}
```

### `POST /messages`

Send MCP requests via HTTP POST.

**Request:**
Send any MCP request as JSON in the request body.

**Response:**
Returns the corresponding MCP response.

### `GET /sse`

Server-Sent Events endpoint for real-time communication.

**Connection:**

```javascript
const eventSource = new EventSource('http://localhost:3000/sse');

eventSource.onmessage = function (event) {
	const data = JSON.parse(event.data);
	console.log('Received:', data);
};
```

**Events:**

- `connected` - Sent when client connects
- `response` - Sent when server processes requests

## Error Codes

The server returns standard JSON-RPC error codes:

- `-32700` - Parse error (invalid JSON)
- `-32601` - Method not found
- `-32602` - Invalid params (resource/tool/prompt not found)
- `-32603` - Internal error

## Complete Workflow Example

Here's a complete example of initializing and using the MCP server:

```javascript
// 1. Initialize the server
const initRequest = {
	jsonrpc: '2.0',
	id: 1,
	method: 'initialize',
	params: {},
};

// 2. List available tools
const listToolsRequest = {
	jsonrpc: '2.0',
	id: 2,
	method: 'tools/list',
	params: {},
};

// 3. Invoke the echo tool
const invokeEchoRequest = {
	jsonrpc: '2.0',
	id: 3,
	method: 'tools/invoke',
	params: {
		name: 'echo',
		parameters: {
			message: 'MCP World',
		},
	},
};

// 4. Get a dynamic resource
const getResourceRequest = {
	jsonrpc: '2.0',
	id: 4,
	method: 'resources/get',
	params: {
		uri: 'greeting://Developer',
	},
};
```

## Example Usage

### STDIO Communication

```javascript
const { spawn } = require('child_process');

const server = spawn('node', ['stdio-server.js']);

// Send MCP request
const request = {
	jsonrpc: '2.0',
	id: 1,
	method: 'tools/invoke',
	params: { name: 'echo', parameters: { message: 'test' } },
};

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.on('data', (data) => {
	const response = JSON.parse(data.toString());
	console.log(response);
	// Output: { jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: 'Hello test' }] } }
});
```

### HTTP Communication

```javascript
const axios = require('axios');

const request = {
	jsonrpc: '2.0',
	id: 1,
	method: 'resources/get',
	params: { uri: 'greeting://World' },
};

axios.post('http://localhost:3000/messages', request).then((response) => {
	console.log(response.data);
	// Output: { jsonrpc: '2.0', id: 1, result: { data: 'Hello World!' } }
});
```

## Project Structure

```
├── http-server.js     # HTTP/SSE server entry point
├── mcp-server.js      # Core MCP server implementation
├── stdio-server.js    # STDIO server entry point
├── package.json       # Project dependencies and scripts
├── test/
│   ├── http-server.test.js    # HTTP server tests
│   ├── mcp-server.test.js     # Core server tests
│   └── stdio-server.test.js   # STDIO server tests
└── README.md
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature develop`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT

Copyright (c) 2025 Rikki Tripp - [Trippnology](https://trippnology.com)

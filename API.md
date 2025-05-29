# API Documentation

Complete API reference for the MCP Server Hello World implementation.

## Table of Contents

- [Protocol Overview](#protocol-overview)
- [Server Initialization](#server-initialization)
- [Resources](#resources)
- [Tools](#tools)
- [Prompts](#prompts)
- [HTTP Server Endpoints](#http-server-endpoints)
- [Error Codes](#error-codes)
- [Complete Workflow Example](#complete-workflow-example)
- [Usage Examples](#usage-examples)

## Protocol Overview

All requests follow the JSON-RPC 2.0 specification:

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

## Server Initialization

### `initialize`

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

### `resources/list`

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

### `resources/read`

Retrieve a specific resource by URI.

**Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "resources/read",
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
	"method": "resources/read",
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

### `tools/list`

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

### `tools/call`

Invoke a specific tool with parameters.

**Request for echo tool:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/call",
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
	"method": "tools/call",
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

### `prompts/list`

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

### `prompts/get`

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

When running in HTTP mode (`mcp-hello-world --mode http`), the server provides these REST endpoints:

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
	method: 'tools/call',
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
	method: 'resources/read',
	params: {
		uri: 'greeting://Developer',
	},
};
```

## Usage Examples

### STDIO Communication

```javascript
const { spawn } = require('child_process');

// When installed as dev dependency
const server = spawn('./node_modules/.bin/mcp-hello-world', [
	'--mode',
	'stdio',
]);

// When installed globally
// const server = spawn('mcp-hello-world', ['--mode', 'stdio']);

// Send MCP request
const request = {
	jsonrpc: '2.0',
	id: 1,
	method: 'tools/call',
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

// Start server: npx @trippnology/mcp-server-hello-world --mode http
// Or: mcp-hello-world --mode http --port 3000

const request = {
	jsonrpc: '2.0',
	id: 1,
	method: 'resources/read',
	params: { uri: 'greeting://World' },
};

axios.post('http://localhost:3000/messages', request).then((response) => {
	console.log(response.data);
	// Output: { jsonrpc: '2.0', id: 1, result: { data: 'Hello World!' } }
});
```

### Integration in Test Suites

```javascript
// In your test setup (e.g., Jest, Mocha)
const { spawn } = require('child_process');

describe('MCP Integration Tests', () => {
	let mcpServer;

	beforeAll(async () => {
		// Start MCP server for testing
		mcpServer = spawn('npx', [
			'@trippnology/mcp-server-hello-world',
			'--mode',
			'stdio',
		]);

		// Wait for server to be ready
		await new Promise((resolve) => setTimeout(resolve, 1000));
	});

	afterAll(() => {
		if (mcpServer) {
			mcpServer.kill();
		}
	});

	test('should echo message', (done) => {
		const request = {
			jsonrpc: '2.0',
			id: 1,
			method: 'tools/call',
			params: { name: 'echo', parameters: { message: 'test' } },
		};

		mcpServer.stdin.write(JSON.stringify(request) + '\n');

		mcpServer.stdout.once('data', (data) => {
			const response = JSON.parse(data.toString());
			expect(response.result.content[0].text).toBe('Hello test');
			done();
		});
	});
});
```

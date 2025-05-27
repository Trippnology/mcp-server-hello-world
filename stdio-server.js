#!/usr/bin/env node
// index.js - STDIO MCP server
const MCPServer = require('./mcp-server');

class STDIOMCPServer {
	constructor() {
		this.mcpServer = new MCPServer();
		this.setupInput();
	}

	setupInput() {
		process.stdin.setEncoding('utf8');

		let buffer = '';

		process.stdin.on('data', (chunk) => {
			buffer += chunk;

			// Process complete lines
			const lines = buffer.split('\n');
			buffer = lines.pop(); // Keep incomplete line in buffer

			lines.forEach((line) => {
				if (line.trim()) {
					this.handleMessage(line.trim());
				}
			});
		});

		process.stdin.on('end', () => {
			if (buffer.trim()) {
				this.handleMessage(buffer.trim());
			}
		});
	}

	handleMessage(message) {
		try {
			const request = JSON.parse(message);
			const response = this.mcpServer.handleRequest(request);
			this.sendResponse(response);
		} catch (error) {
			const errorResponse = {
				jsonrpc: '2.0',
				id: null,
				error: { code: -32700, message: 'Parse error' },
			};
			this.sendResponse(errorResponse);
		}
	}

	sendResponse(response) {
		process.stdout.write(`${JSON.stringify(response)}\n`);
	}
}

// Start the server if this file is run directly
if (require.main === module) {
	new STDIOMCPServer();
}

module.exports = STDIOMCPServer;

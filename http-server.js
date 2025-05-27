// http-server.js - HTTP/SSE MCP server using Hapi
const Stream = require('node:stream');
const Hapi = require('@hapi/hapi');
const MCPServer = require('./mcp-server');

class HTTPMCPServer {
	constructor() {
		this.mcpServer = new MCPServer();
		this.server = null;
		this.sseClients = new Set();
	}

	async init() {
		this.server = Hapi.server({
			port: 3000,
			host: 'localhost',
			routes: {
				cors: {
					origin: ['*'],
					credentials: true,
				},
			},
		});

		// SSE endpoint
		this.server.route({
			method: 'GET',
			path: '/sse',
			handler: this.handleSSE.bind(this),
		});

		// Message endpoint for HTTP POST requests
		this.server.route({
			method: 'POST',
			path: '/messages',
			handler: this.handleMessage.bind(this),
		});

		// Health check
		this.server.route({
			method: 'GET',
			path: '/health',
			handler: () => ({
				status: 'ok',
				timestamp: new Date().toISOString(),
			}),
		});

		await this.server.start();
		console.log('MCP HTTP Server running on %s', this.server.info.uri);
	}

	async handleSSE(request, h) {
		class ResponseStream extends Stream.PassThrough {
			setCompressor(compressor) {
				this._compressor = compressor;
			}
		}

		const stream = new ResponseStream();

		// Add client to set
		const client = { stream, request };
		this.sseClients.add(client);

		// Send initial connection event
		this.sendSSEMessage(stream, 'connected', {
			message: 'MCP Server connected',
		});

		// Handle client disconnect
		request.events.once('disconnect', () => {
			this.sseClients.delete(client);
			stream.push(null); // End the stream
		});

		return h
			.response(stream)
			.type('text/event-stream')
			.header('Cache-Control', 'no-cache')
			.header('Connection', 'keep-alive')
			.header('X-Accel-Buffering', 'no')
			.code(200);
	}

	async handleMessage(request, h) {
		try {
			const mcpRequest = request.payload;
			const mcpResponse = this.mcpServer.handleRequest(mcpRequest);

			// If this is an SSE client, send via SSE as well
			if (mcpRequest.id) {
				this.broadcastSSE('response', mcpResponse);
			}

			return mcpResponse;
		} catch (error) {
			return h
				.response({
					jsonrpc: '2.0',
					id: request.payload?.id || null,
					error: { code: -32603, message: 'Internal error' },
				})
				.code(500);
		}
	}

	sendSSEMessage(stream, event, data) {
		const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
		stream.push(message);
	}

	broadcastSSE(event, data) {
		const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
		this.sseClients.forEach((client) => {
			try {
				client.stream.push(message);
			} catch (error) {
				// Remove disconnected clients
				this.sseClients.delete(client);
			}
		});
	}

	async stop() {
		if (this.server) {
			await this.server.stop();
		}
	}
}

// Start the server if this file is run directly
if (require.main === module) {
	const httpServer = new HTTPMCPServer();
	httpServer.init().catch(console.error);

	// Graceful shutdown
	async function shutdown() {
		console.log('Shutting down HTTP server...');
		await httpServer.stop();
		process.exit(0);
	}

	process.on('SIGTERM', shutdown);

	process.on('SIGINT', shutdown);
}

module.exports = HTTPMCPServer;

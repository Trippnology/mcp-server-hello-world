// test/http-server.test.js
const { expect } = require('chai');
const axios = require('axios');
const HTTPMCPServer = require('../http-server');

describe('HTTP MCP Server', () => {
	let server;
	const baseURL = 'http://localhost:3000';

	before(async () => {
		server = new HTTPMCPServer();
		await server.init();
		// Give the server a moment to fully start
		await new Promise((resolve) => setTimeout(resolve, 100));
	});

	after(async () => {
		if (server) {
			await server.stop();
		}
	});

	describe('health check', () => {
		it('should respond to health check', async () => {
			const response = await axios.get(`${baseURL}/health`);

			expect(response.status).to.equal(200);
			expect(response.data).to.have.property('status', 'ok');
			expect(response.data).to.have.property('timestamp');
		});
	});

	describe('message endpoint', () => {
		it('should handle initialize request', async () => {
			const mcpRequest = {
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {},
			};

			const response = await axios.post(
				`${baseURL}/messages`,
				mcpRequest,
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				result: {
					protocolVersion: '2024-11-05',
					capabilities: {
						resources: { subscribe: false, listChanged: false },
						tools: { listChanged: false },
						prompts: { listChanged: false },
					},
					serverInfo: {
						name: 'mcp-hello-world-nodejs',
						version: '1.0.0',
					},
				},
			});
		});

		it('should handle echo tool invocation', async () => {
			const mcpRequest = {
				jsonrpc: '2.0',
				id: 2,
				method: 'tools/call',
				params: { name: 'echo', parameters: { message: 'HTTP test' } },
			};

			const response = await axios.post(
				`${baseURL}/messages`,
				mcpRequest,
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.deep.equal({
				jsonrpc: '2.0',
				id: 2,
				result: {
					content: [{ type: 'text', text: 'Hello HTTP test' }],
				},
			});
		});

		it('should handle resource get request', async () => {
			const mcpRequest = {
				jsonrpc: '2.0',
				id: 3,
				method: 'resources/read',
				params: { uri: 'greeting://Bob' },
			};

			const response = await axios.post(
				`${baseURL}/messages`,
				mcpRequest,
			);

			expect(response.status).to.equal(200);
			expect(response.data).to.deep.equal({
				jsonrpc: '2.0',
				id: 3,
				result: { data: 'Hello Bob!' },
			});
		});

		it('should handle invalid requests gracefully', async () => {
			try {
				await axios.post(`${baseURL}/messages`, { invalid: 'request' });
			} catch (error) {
				expect(error.response.status).to.equal(500);
				expect(error.response.data).to.have.property('error');
			}
		});
	});

	describe('SSE endpoint', () => {
		it('should accept SSE connections', async () => {
			const response = await axios.get(`${baseURL}/sse`, {
				responseType: 'stream',
				timeout: 1000,
			});

			expect(response.status).to.equal(200);
			expect(response.headers['content-type']).to.include(
				'text/event-stream',
			);
			expect(response.headers['cache-control']).to.equal('no-cache');
			expect(response.headers.connection).to.equal('keep-alive');

			// Close the stream
			response.data.destroy();
		});
	});
});

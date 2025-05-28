// test/mcp-server.test.js
const { expect } = require('chai');
const MCPServer = require('../mcp-server');

describe('Core MCP Server', () => {
	let server;

	beforeEach(() => {
		server = new MCPServer();
	});

	describe('initialization', () => {
		it('should handle initialize request', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {},
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
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
	});

	describe('resources', () => {
		it('should list resources', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'resources/list',
				params: {},
			};

			const response = server.handleRequest(request);

			expect(response.result.resources).to.be.an('array');
			expect(response.result.resources).to.have.length(1);
			expect(response.result.resources[0]).to.deep.equal({
				uri: 'hello://world',
				name: 'Hello World',
				description: 'A static Hello World resource',
			});
		});

		it('should get hello world resource', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'resources/get',
				params: { uri: 'hello://world' },
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				result: { data: 'Hello World!' },
			});
		});

		it('should get dynamic greeting resource', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'resources/get',
				params: { uri: 'greeting://Alice' },
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				result: { data: 'Hello Alice!' },
			});
		});

		it('should return error for non-existent resource', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'resources/get',
				params: { uri: 'nonexistent://resource' },
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32602, message: 'Resource not found' },
			});
		});
	});

	describe('tools', () => {
		it('should list tools', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
				params: {},
			};

			const response = server.handleRequest(request);

			expect(response.result.tools).to.be.an('array');
			expect(response.result.tools).to.have.length(2);

			const toolNames = response.result.tools.map((t) => t.name);
			expect(toolNames).to.include.members(['echo', 'debug']);
		});

		it('should invoke echo tool', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: {
					name: 'echo',
					parameters: { message: 'test message' },
				},
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				result: {
					content: [{ type: 'text', text: 'Hello test message' }],
				},
			});
		});

		it('should invoke debug tool', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'debug', parameters: {} },
			};

			const response = server.handleRequest(request);

			expect(response.result.content).to.be.an('array');
			expect(response.result.content[0].type).to.equal('text');

			const debugInfo = JSON.parse(response.result.content[0].text);
			expect(debugInfo).to.have.property('resources');
			expect(debugInfo).to.have.property('tools');
			expect(debugInfo).to.have.property('prompts');
		});

		it('should return error for non-existent tool', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'nonexistent', parameters: {} },
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32602, message: 'Tool not found' },
			});
		});
	});

	describe('prompts', () => {
		it('should list prompts', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'prompts/list',
				params: {},
			};

			const response = server.handleRequest(request);

			expect(response.result.prompts).to.be.an('array');
			expect(response.result.prompts).to.have.length(1);
			expect(response.result.prompts[0]).to.deep.equal({
				name: 'helpful-assistant',
				description: 'A basic assistant prompt definition',
			});
		});

		it('should get helpful-assistant prompt', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'prompts/get',
				params: { name: 'helpful-assistant' },
			};

			const response = server.handleRequest(request);

			expect(response.result.messages).to.be.an('array');
			expect(response.result.messages).to.have.length(2);
			expect(response.result.messages[0].role).to.equal('system');
			expect(response.result.messages[1].role).to.equal('user');
		});

		it('should return error for non-existent prompt', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'prompts/get',
				params: { name: 'nonexistent' },
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32602, message: 'Prompt not found' },
			});
		});
	});

	describe('error handling', () => {
		it('should return method not found error', () => {
			const request = {
				jsonrpc: '2.0',
				id: 1,
				method: 'unknown/method',
				params: {},
			};

			const response = server.handleRequest(request);

			expect(response).to.deep.equal({
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32601, message: 'Method not found' },
			});
		});
	});
});

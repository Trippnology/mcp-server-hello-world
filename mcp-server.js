// mcp-server.js - Core MCP server functionality
class MCPServer {
	constructor() {
		this.resources = new Map();
		this.tools = new Map();
		this.prompts = new Map();
		this.initialize();
	}

	initialize() {
		// Initialize default resources
		this.resources.set('hello://world', {
			uri: 'hello://world',
			name: 'Hello World',
			description: 'A static Hello World resource',
			handler: () => ({ data: 'Hello World!' }),
		});

		// Initialize tools
		this.tools.set('echo', {
			name: 'echo',
			description: 'Echoes the input message, prefixed with "Hello "',
			inputSchema: {
				type: 'object',
				properties: {
					message: { type: 'string' },
				},
				required: ['message'],
			},
			handler: (params) => ({
				content: [{ type: 'text', text: `Hello ${params.message}` }],
			}),
		});

		this.tools.set('debug', {
			name: 'debug',
			description:
				'Lists all available MCP method definitions on the server',
			inputSchema: {
				type: 'object',
				properties: {},
			},
			handler: () => ({
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								resources: Array.from(this.resources.keys()),
								tools: Array.from(this.tools.keys()).map(
									(name) => ({
										name,
										description:
											this.tools.get(name).description,
									}),
								),
								prompts: Array.from(this.prompts.keys()).map(
									(name) => ({
										name,
										description:
											this.prompts.get(name).description,
									}),
								),
							},
							null,
							2,
						),
					},
				],
			}),
		});

		// Initialize prompts
		this.prompts.set('helpful-assistant', {
			name: 'helpful-assistant',
			description: 'A basic assistant prompt definition',
			handler: () => ({
				messages: [
					{
						role: 'system',
						content: {
							type: 'text',
							text: 'You are a helpful assistant.',
						},
					},
					{
						role: 'user',
						content: {
							type: 'text',
							text: 'How can I help you today?',
						},
					},
				],
			}),
		});
	}

	handleRequest(request) {
		try {
			const { id, method, params } = request;

			switch (method) {
				case 'initialize':
					return this.createResponse(id, {
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
					});

				case 'resources/list':
					return this.createResponse(id, {
						resources: Array.from(this.resources.values()).map(
							(r) => ({
								uri: r.uri,
								name: r.name,
								description: r.description,
							}),
						),
					});

				case 'resources/get':
					return this.handleResourceGet(id, params);

				case 'tools/list':
					return this.createResponse(id, {
						tools: Array.from(this.tools.values()).map((t) => ({
							name: t.name,
							description: t.description,
							inputSchema: t.inputSchema,
						})),
					});

				case 'tools/invoke':
					return this.handleToolInvoke(id, params);

				case 'prompts/list':
					return this.createResponse(id, {
						prompts: Array.from(this.prompts.values()).map((p) => ({
							name: p.name,
							description: p.description,
						})),
					});

				case 'prompts/get':
					return this.handlePromptGet(id, params);

				default:
					return this.createErrorResponse(
						id,
						-32601,
						'Method not found',
					);
			}
		} catch (error) {
			return this.createErrorResponse(
				request.id,
				-32603,
				'Internal error',
			);
		}
	}

	handleResourceGet(id, params) {
		const { uri } = params;

		// Handle dynamic greeting resources
		if (uri.startsWith('greeting://')) {
			const name = uri.replace('greeting://', '');
			return this.createResponse(id, { data: `Hello ${name}!` });
		}

		// Handle static resources
		const resource = this.resources.get(uri);
		if (!resource) {
			return this.createErrorResponse(id, -32602, 'Resource not found');
		}

		return this.createResponse(id, resource.handler());
	}

	handleToolInvoke(id, params) {
		const { name, parameters } = params;
		const tool = this.tools.get(name);

		if (!tool) {
			return this.createErrorResponse(id, -32602, 'Tool not found');
		}

		return this.createResponse(id, tool.handler(parameters || {}));
	}

	handlePromptGet(id, params) {
		const { name } = params;
		const prompt = this.prompts.get(name);

		if (!prompt) {
			return this.createErrorResponse(id, -32602, 'Prompt not found');
		}

		return this.createResponse(id, prompt.handler());
	}

	createResponse(id, result) {
		return {
			jsonrpc: '2.0',
			id,
			result,
		};
	}

	createErrorResponse(id, code, message) {
		return {
			jsonrpc: '2.0',
			id,
			error: { code, message },
		};
	}
}

module.exports = MCPServer;

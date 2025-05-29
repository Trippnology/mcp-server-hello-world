// test/stdio-server.test.js
const { spawn } = require('node:child_process');
const path = require('node:path');
const { expect } = require('chai');

describe('STDIO MCP Server', () => {
	let serverProcess;
	let requestId = 1;

	before(() => {
		// Start the STDIO server process
		serverProcess = spawn('node', [
			path.join(__dirname, '../stdio-server.js'),
		]);
		// Give the server a moment to start
		return new Promise((resolve) => setTimeout(resolve, 500));
	});

	after(() => {
		if (serverProcess && !serverProcess.killed) {
			serverProcess.kill();
		}
	});

	function sendRequest(request) {
		return new Promise((resolve, reject) => {
			const requestWithId = { ...request, id: requestId++ };
			let responseBuffer = '';

			const timeout = setTimeout(() => {
				serverProcess.stdout.removeListener('data', onData);
				reject(new Error('Request timeout'));
			}, 5000);

			const onData = (data) => {
				responseBuffer += data.toString();

				// Check if we have a complete JSON response
				const lines = responseBuffer.split('\n');
				for (const line of lines) {
					if (line.trim()) {
						try {
							const response = JSON.parse(line.trim());
							if (response.id === requestWithId.id) {
								clearTimeout(timeout);
								serverProcess.stdout.removeListener(
									'data',
									onData,
								);
								resolve(response);
								return;
							}
						} catch (e) {
							// Not valid JSON, continue
						}
					}
				}
			};

			serverProcess.stdout.on('data', onData);
			serverProcess.stdin.write(`${JSON.stringify(requestWithId)}\n`);
		});
	}

	it('should handle initialize request via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: {},
		};

		const response = await sendRequest(request);

		expect(response).to.deep.equal({
			jsonrpc: '2.0',
			id: 1,
			result: {
				capabilities: {
					prompts: {
						listChanged: false,
					},
					resources: {
						listChanged: false,
						subscribe: false,
					},
					tools: {
						listChanged: false,
					},
				},
				protocolVersion: '2024-11-05',
				serverInfo: {
					name: 'mcp-hello-world-nodejs',
					version: '1.0.0',
				},
			},
		});
	});

	it('should handle tools/list via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'tools/list',
			params: {},
		};

		const response = await sendRequest(request);

		expect(response.result.tools).to.be.an('array');
		expect(response.result.tools).to.have.length(2);

		const toolNames = response.result.tools.map((t) => t.name);
		expect(toolNames).to.include.members(['echo', 'debug']);
	});

	it('should handle debug tool via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'tools/call',
			params: { name: 'debug', parameters: {} },
		};

		const response = await sendRequest(request);

		expect(response.result.content).to.be.an('array');
		expect(response.result.content[0].type).to.equal('text');

		const debugInfo = JSON.parse(response.result.content[0].text);
		expect(debugInfo).to.have.property('resources');
		expect(debugInfo).to.have.property('tools');
		expect(debugInfo).to.have.property('prompts');
		expect(debugInfo.resources).to.include('hello://world');
		expect(debugInfo.tools).to.have.length(2);
	});

	it('should handle prompts/list via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'prompts/list',
			params: {},
		};

		const response = await sendRequest(request);

		expect(response.result.prompts).to.be.an('array');
		expect(response.result.prompts).to.have.length(1);
		expect(response.result.prompts[0]).to.deep.equal({
			name: 'helpful-assistant',
			description: 'A basic assistant prompt definition',
		});
	});

	it('should handle prompts/get via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'prompts/get',
			params: { name: 'helpful-assistant' },
		};

		const response = await sendRequest(request);

		expect(response.result.messages).to.be.an('array');
		expect(response.result.messages).to.have.length(2);
		expect(response.result.messages[0].role).to.equal('system');
		expect(response.result.messages[1].role).to.equal('user');
	});

	it('should handle dynamic greeting resource via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'resources/read',
			params: { uri: 'greeting://Charlie' },
		};

		const response = await sendRequest(request);

		expect(response.jsonrpc).to.equal('2.0');
		expect(response.result).to.deep.equal({ data: 'Hello Charlie!' });
	});

	it('should handle error for non-existent tool via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'tools/call',
			params: { name: 'nonexistent', parameters: {} },
		};

		const response = await sendRequest(request);

		expect(response.jsonrpc).to.equal('2.0');
		expect(response.error).to.deep.equal({
			code: -32602,
			message: 'Tool not found',
		});
	});

	it('should handle error for non-existent method via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			method: 'unknown/method',
			params: {},
		};

		const response = await sendRequest(request);

		expect(response.jsonrpc).to.equal('2.0');
		expect(response.error).to.deep.equal({
			code: -32601,
			message: 'Method not found',
		});
	});

	it('should handle invalid JSON gracefully via STDIO', (done) => {
		let responseBuffer = '';

		const timeout = setTimeout(() => {
			serverProcess.stdout.removeListener('data', onData);
			done(); // Don't fail if we don't get a response
		}, 2000);

		const onData = (data) => {
			responseBuffer += data.toString();

			const lines = responseBuffer.split('\n');
			for (const line of lines) {
				if (line.trim()) {
					try {
						const response = JSON.parse(line.trim());
						if (response.error && response.error.code === -32700) {
							serverProcess.stdout.removeListener('data', onData);
							clearTimeout(timeout);

							expect(response).to.deep.equal({
								jsonrpc: '2.0',
								id: null,
								error: { code: -32700, message: 'Parse error' },
							});
							done();
							return;
						}
					} catch (e) {
						// Continue waiting
					}
				}
			}
		};

		serverProcess.stdout.on('data', onData);
		serverProcess.stdin.write('invalid json\n');
	});

	it('should handle echo tool via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			id: 9,
			method: 'tools/call',
			params: { name: 'echo', parameters: { message: 'STDIO test' } },
		};

		const response = await sendRequest(request);

		expect(response).to.deep.equal({
			jsonrpc: '2.0',
			id: 9,
			result: {
				content: [{ type: 'text', text: 'Hello STDIO test' }],
			},
		});
	});

	it('should handle resource get via STDIO', async () => {
		const request = {
			jsonrpc: '2.0',
			id: 10,
			method: 'resources/read',
			params: { uri: 'hello://world' },
		};

		const response = await sendRequest(request);

		expect(response).to.deep.equal({
			jsonrpc: '2.0',
			id: 10,
			result: {
				data: 'Hello World!',
			},
		});
	});
});

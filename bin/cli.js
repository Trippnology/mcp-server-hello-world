#!/usr/bin/env node

const path = require('node:path');
const { spawn } = require('node:child_process');
const fs = require('node:fs');

const { Command } = require('commander');

const program = new Command();

// Read package.json for version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

program
	.name('mcp-hello-world')
	.description(
		'MCP Server Hello World - A lightweight Model Context Protocol server for testing and development',
	)
	.version(packageJson.version);

program
	.option('-m, --mode <type>', 'communication mode (stdio|http)', 'stdio')
	.option('-p, --port <number>', 'HTTP server port', '3000')
	.option('-h, --host <string>', 'HTTP server host', 'localhost')
	.option('-v, --verbose', 'enable verbose logging')
	.action((options) => {
		const { mode, port, host, verbose } = options;

		// Validate mode
		if (!['stdio', 'http'].includes(mode)) {
			console.error('Error: Mode must be either "stdio" or "http"');
			process.exit(1);
		}

		// Validate port for HTTP mode
		if (mode === 'http') {
			const portNum = Number.parseInt(port, 10);
			if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
				console.error(
					'Error: Port must be a valid number between 1 and 65535',
				);
				process.exit(1);
			}
		}

		// Set environment variables for the server
		const env = { ...process.env };

		if (mode === 'http') {
			env.MCP_PORT = port;
			env.MCP_HOST = host;
		}

		if (verbose) {
			env.MCP_VERBOSE = 'true';
		}

		// Determine which server file to run
		const serverFile =
			mode === 'http' ? 'http-server.js' : 'stdio-server.js';
		const serverPath = path.join(__dirname, '..', serverFile);

		// Check if server file exists
		if (!fs.existsSync(serverPath)) {
			console.error(`Error: Server file not found: ${serverPath}`);
			process.exit(1);
		}

		if (verbose) {
			console.log(
				`Starting MCP Hello World server in ${mode.toUpperCase()} mode...`,
			);
			if (mode === 'http') {
				console.log(`Server will listen on ${host}:${port}`);
			}
		}

		// Spawn the appropriate server
		const server = spawn('node', [serverPath], {
			env,
			stdio: 'inherit', // Pass through stdin/stdout/stderr
		});

		// Handle server process events
		server.on('error', (err) => {
			console.error('Failed to start server:', err.message);
			process.exit(1);
		});

		server.on('close', (code) => {
			if (verbose) {
				console.log(`Server process exited with code ${code}`);
			}
			process.exit(code);
		});

		// Handle graceful shutdown
		const shutdown = (signal) => {
			if (verbose) {
				console.log(
					`\nReceived ${signal}, shutting down gracefully...`,
				);
			}
			server.kill(signal);
		};

		process.on('SIGINT', () => shutdown('SIGINT'));
		process.on('SIGTERM', () => shutdown('SIGTERM'));
	});

// Add some helpful examples to the help text
program.addHelpText(
	'after',
	`
Examples:
  $ mcp-hello-world                           Start in STDIO mode (default)
  $ mcp-hello-world --mode stdio --verbose    Start in STDIO mode with verbose logging
  $ mcp-hello-world --mode http               Start HTTP server on localhost:3000
  $ mcp-hello-world --mode http --port 8080   Start HTTP server on localhost:8080
  $ mcp-hello-world --mode http --host 0.0.0.0 --port 3000  Start HTTP server on all interfaces

For more information, visit: https://github.com/trippnology/mcp-server-hello-world
`,
);

program.parse();

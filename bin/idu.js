#!/usr/bin/env node

const { Command } = require('commander');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const packageManager = existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))
	? 'pnpm'
	: 'npm';

const targetScriptMap = {
	all: 'dev',
	web: 'dev:web',
	backend: 'dev:backend',
	express: 'dev:express',
	docs: 'dev:docs',
};

const runScript = (scriptName) => {
	const child = spawn(packageManager, ['run', scriptName], {
		cwd: projectRoot,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});

	child.on('exit', (code) => {
		process.exit(code ?? 0);
	});

	child.on('error', () => {
		process.exit(1);
	});
};

const program = new Command();

program.name('idu').description('Intent-Driven-UI CLI').version('0.3.2');

program
	.command('start')
	.description('启动项目，默认启动全部应用')
	.argument('[target]', '启动目标: all|web|backend|express|docs', 'all')
	.action((target) => {
		const normalizedTarget = String(target).toLowerCase();
		const scriptName = targetScriptMap[normalizedTarget];
		if (!scriptName) {
			process.exitCode = 1;
			console.error(
				`无效目标 "${target}"，可选值: ${Object.keys(targetScriptMap).join(', ')}`,
			);
			return;
		}

		runScript(scriptName);
	});

program.parse(process.argv);

import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

const processes = [
  { name: 'api', color: '\x1b[33m', args: ['run', 'dev:api'] },
  { name: 'web', color: '\x1b[36m', args: ['run', 'dev:web'] },
];

const reset = '\x1b[0m';
const children = [];
let shuttingDown = false;

function prefixAndWrite(name, color, chunk, stream) {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.length === 0 && i === lines.length - 1) {
      continue;
    }
    stream.write(`${color}[${name}]${reset} ${line}\n`);
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => process.exit(code), 200);
}

for (const proc of processes) {
  const command = isWindows ? 'cmd.exe' : 'npm';
  const args = isWindows ? ['/d', '/s', '/c', 'npm', ...proc.args] : proc.args;

  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
  });

  children.push(child);

  child.stdout.on('data', (chunk) => prefixAndWrite(proc.name, proc.color, chunk, process.stdout));
  child.stderr.on('data', (chunk) => prefixAndWrite(proc.name, proc.color, chunk, process.stderr));

  child.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      shutdown(code);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

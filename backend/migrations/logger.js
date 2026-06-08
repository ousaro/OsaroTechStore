const PREFIX = "[migrate]";

export const log = (msg) => process.stdout.write(`${PREFIX} ${msg}\n`);
export const ok = (msg) => process.stdout.write(`${PREFIX} ✓ ${msg}\n`);
export const error = (msg) => process.stderr.write(`${PREFIX} ✗ ${msg}\n`);

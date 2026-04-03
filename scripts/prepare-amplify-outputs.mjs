import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootOutputsPath = resolve(process.cwd(), 'amplify_outputs.json');
const publicDir = resolve(process.cwd(), 'public');
const publicOutputsPath = resolve(publicDir, 'amplify_outputs.json');

mkdirSync(publicDir, { recursive: true });

if (existsSync(rootOutputsPath)) {
  cpSync(rootOutputsPath, publicOutputsPath);
} else {
  writeFileSync(publicOutputsPath, '{}\n', 'utf8');
}

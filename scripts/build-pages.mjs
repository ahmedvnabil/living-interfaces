import { cpSync, mkdirSync, rmSync } from 'node:fs';

const output = 'dist-pages';
const directories = ['assets', 'docs', 'examples', 'themes', 'vendor'];
const files = ['index.html', 'studio.html', 'README.md', 'LICENSE'];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const directory of directories) {
  cpSync(directory, `${output}/${directory}`, { recursive: true });
}

for (const file of files) {
  cpSync(file, `${output}/${file}`);
}

console.log(`GitHub Pages artifact created in ${output}/`);

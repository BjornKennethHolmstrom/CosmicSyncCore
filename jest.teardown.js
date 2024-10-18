import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async () => {
  // Give some time for any hanging processes to close
  await new Promise(resolve => setTimeout(resolve, 2000));

  const testDataDir = path.join(__dirname, 'local-storage-*');
  const directories = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('local-storage-'))
    .map(dirent => path.join(__dirname, dirent.name));

  directories.forEach(dir => {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned up directory: ${dir}`);
  });
};

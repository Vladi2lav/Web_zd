import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import HomeClient from "./home-client";

function getFolders() {
  const zdPath = join(process.cwd(), 'public', 'zd');
  const folders = readdirSync(zdPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  return folders.map(folder => {
    const taskFile = join(zdPath, folder, 'task.txt');
    let number = '01';
    try {
      const content = readFileSync(taskFile, 'utf-8');
      const firstLine = content.split('\n')[0].trim();
      if (firstLine) number = firstLine;
    } catch (e) {
      // ignore
    }
    return {
      id: `zd-${folder}`,
      name: folder,
      number,
      uniqueId: `ZD-${folder}`,
      url: `/zd/${folder}/index.html`
    };
  }).sort((a, b) => parseInt(a.number) - parseInt(b.number));
}

export default function Home() {
  const containerData = getFolders();

  return <HomeClient containerData={containerData} />;
}
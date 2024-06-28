import fs from 'fs';
import path from 'path';

type Metadata = {
  title: string;
  description: string;
  author: string;
  image: string;
  publishedAt: string;
};

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, '').trim();
  let frontMatterLines = frontMatterBlock?.trim().split('\n');
  let metadata: Partial<Metadata> = {};

  frontMatterLines?.forEach((line) => {
    let [key, ...valueArr] = line.split(': ');
    let value = valueArr.join(': ').trim();
    value = value.replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
    metadata[key?.trim() as keyof Metadata] = value as any;
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir: string) {
  // Ensure dir is a string
  if (typeof dir !== 'string') {
    throw new Error('Directory path must be a string');
  }

  // Resolve the directory to an absolute path within a safe base directory
  const safeBaseDirectory = path.resolve(process.cwd(), 'src/content');
  const absoluteDir = path.resolve(safeBaseDirectory, dir);

  // Check if the resolved directory path is within the safe base directory
  if (!absoluteDir.startsWith(safeBaseDirectory)) {
    throw new Error('Invalid directory path');
  }

  return fs
    .readdirSync(absoluteDir)
    .filter((file) => path.extname(file) === '.mdx');
}

function readMDXFile(filePath: string) {
  // Ensure filePath is a string
  if (typeof filePath !== 'string') {
    throw new Error('File path must be a string');
  }

  // Resolve the file path to an absolute path within a safe base directory
  const safeBaseDirectory = path.resolve(process.cwd(), 'src/content');
  const absoluteFilePath = path.resolve(safeBaseDirectory, filePath);

  // Check if the resolved file path is within the safe base directory
  if (!absoluteFilePath.startsWith(safeBaseDirectory)) {
    throw new Error('Invalid file path');
  }

  let rawContent = fs.readFileSync(absoluteFilePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));
    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getLegal() {
  return getMDXData('legal');
}

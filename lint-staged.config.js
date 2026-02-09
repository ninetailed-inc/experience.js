const path = require('node:path');
const { workspaceRoot } = require('@nrwl/devkit');

const ignoreFiles = [
  'package.json',
  'pnpm-lock.yaml',
  '.eslintrc.js',
  'nx.json',
];

module.exports = {
  '*': (stagedFiles) => {
    const stagedFilesRelative = stagedFiles.map((files) => {
      return path.relative(workspaceRoot, files);
    });

    const sanitizedFiles = stagedFilesRelative
      .filter((file) => !ignoreFiles.includes(file))
      .join(',');

    if (!sanitizedFiles.length) {
      return [];
    }
    return [
      `nx format:write --files=${stagedFilesRelative}`,
      `nx affected:lint --files=${sanitizedFiles}`,
    ];
  },
};

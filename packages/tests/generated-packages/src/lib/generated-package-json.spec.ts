import * as fs from 'fs';
import * as path from 'path';

function findPackageJsonPaths(directory: string) {
  const packageJsonPaths: string[] = [];

  function traverseDirectory(directory: string) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (file === 'playgrounds') {
          return;
        }
        traverseDirectory(filePath);
      } else if (file === 'package.json') {
        packageJsonPaths.push(filePath);
      }
    });
  }

  traverseDirectory(directory);

  return packageJsonPaths;
}

function parsePackageJson(packageJsonPath: string) {
  const fileContent = fs.readFileSync(packageJsonPath, 'utf8');

  return JSON.parse(fileContent);
}

describe('testsGeneratedPackageJson', () => {
  const packageJsonPaths = findPackageJsonPaths('dist/packages');

  it.each(packageJsonPaths)(
    '%s should have no type field if it has a module and a main field',
    (packageJsonPath) => {
      const json = parsePackageJson(packageJsonPath);

      const hasModuleField = !!json.module;
      const hasMainField = !!json.main;
      const hasTypeField = !!json.type;

      expect(hasTypeField && hasModuleField && hasMainField).toBeFalsy();
    }
  );

  it.each(packageJsonPaths)(
    '%s should not have "type": "commonjs" if it has a module field',
    (packageJsonPath) => {
      const json = parsePackageJson(packageJsonPath);

      const hasModuleField = !!json.module;
      const isTypeCommonJS = json.type === 'commonjs';

      expect(isTypeCommonJS && hasModuleField).toBeFalsy();
    }
  );
});

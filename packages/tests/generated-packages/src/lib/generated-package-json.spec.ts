import * as fs from 'fs';
import * as path from 'path';

const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

type PackageJson = Record<string, unknown>;

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

function normalizeDependencyVersions(packageJson: PackageJson) {
  const normalizedPackageJson = { ...packageJson };

  dependencyFields.forEach((field) => {
    const dependencies = packageJson[field];

    if (
      typeof dependencies !== 'object' ||
      dependencies === null ||
      Array.isArray(dependencies)
    ) {
      return;
    }

    normalizedPackageJson[field] = Object.fromEntries(
      Object.keys(dependencies).map((dependency) => [dependency, '<version>'])
    );
  });

  return normalizedPackageJson;
}

describe('normalizeDependencyVersions', () => {
  it('preserves dependency topology while ignoring version changes', () => {
    const packageJson = {
      name: 'example-package',
      version: '1.2.3',
      dependencies: { runtime: '^1.0.0' },
      devDependencies: { development: '2.0.0' },
      optionalDependencies: { optional: '~3.0.0' },
      peerDependencies: { peer: '>=4.0.0' },
    };

    expect(normalizeDependencyVersions(packageJson)).toEqual({
      name: 'example-package',
      version: '1.2.3',
      dependencies: { runtime: '<version>' },
      devDependencies: { development: '<version>' },
      optionalDependencies: { optional: '<version>' },
      peerDependencies: { peer: '<version>' },
    });
    expect(packageJson.dependencies.runtime).toBe('^1.0.0');
  });
});

describe('Generated package.json files', () => {
  const packageJsonPaths = findPackageJsonPaths('dist/packages');
  it.each(packageJsonPaths)(
    '%s should match the snapshot',
    (packageJsonPath) => {
      const json = parsePackageJson(packageJsonPath);
      expect(normalizeDependencyVersions(json)).toMatchSnapshot();
    }
  );
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
  it('all emitted package type paths should resolve to real files', () => {
    packageJsonPaths.forEach((packageJsonPath) => {
      const json = parsePackageJson(packageJsonPath);
      const typePaths = new Set(
        [json.types, json.exports?.['.']?.types].filter(
          (value): value is string => typeof value === 'string'
        )
      );

      typePaths.forEach((typePath) => {
        const resolvedTypePath = path.resolve(
          path.dirname(packageJsonPath),
          typePath
        );
        expect(fs.existsSync(resolvedTypePath)).toBeTruthy();
      });
    });
  });
});

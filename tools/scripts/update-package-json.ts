import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

const newVersion = process.argv[2];
const projectPath = process.argv[3];
const packageJsonPath = path.join(projectPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`Updating version of ${packageJsonPath} to ${newVersion}`);

packageJson.version = newVersion;
console.log(`Updated version of package.json to ${newVersion}`);

const ninetailedDependencies = Object.keys(
  packageJson.dependencies || {}
).filter((dependency) => dependency.startsWith('@ninetailed/'));
if (ninetailedDependencies.length > 0) {
  ninetailedDependencies.forEach((dependency) => {
    packageJson.dependencies[dependency] = newVersion;
  });
  console.log(
    `Updated version of @ninetailed dependencies ${ninetailedDependencies.join()} to ${newVersion} in package.json`
  );
}

const ninetailedDevDependencies = Object.keys(
  packageJson.devDependencies || {}
).filter((dependency) => dependency.startsWith('@ninetailed/'));
if (ninetailedDevDependencies.length > 0) {
  ninetailedDevDependencies.forEach((dependency) => {
    packageJson.devDependencies[dependency] = newVersion;
  });
  console.log(
    `Updated version of @ninetailed dev dependencies ${ninetailedDevDependencies.join()} to ${newVersion} in package.json`
  );
}

const ninetailedPeerDependencies = Object.keys(
  packageJson.peerDependencies || {}
).filter((dependency) => dependency.startsWith('@ninetailed/'));
if (ninetailedPeerDependencies.length > 0) {
  ninetailedPeerDependencies.forEach((dependency) => {
    packageJson.peerDependencies[dependency] = newVersion;
  });
  console.log(
    `Updated version of @ninetailed peer dependencies ${ninetailedPeerDependencies.join()} to ${newVersion} in package.json`
  );
}

console.log(
  `Writing updated package.json to ${path.join(process.cwd(), packageJsonPath)}`
);
fs.writeFileSync(
  path.join(process.cwd(), packageJsonPath),
  JSON.stringify(packageJson, null, 2)
);

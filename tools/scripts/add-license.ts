import * as fs from 'fs';
import * as path from 'path';

const LICENSE = 'MIT';

// Function to update package.json file
function updatePackageJson(packageJsonPath: string) {
  // Read the package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Check if license field exists
  if (packageJson.license) {
    // Replace the existing license field
    packageJson.license = LICENSE;
  } else {
    // Add the license field
    packageJson.license = LICENSE;
  }

  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Function to traverse the directory and update package.json files
function traverseDirectory(directory: string) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively traverse subdirectories
      traverseDirectory(filePath);
    } else if (file === 'package.json') {
      console.log('Processing: ', file);

      // Update the package.json file
      updatePackageJson(filePath);
    }
  });
}

// Start traversing from the current directory
const currentDirectory = 'packages';
traverseDirectory(currentDirectory);

// update main package.json
updatePackageJson('./package.json');

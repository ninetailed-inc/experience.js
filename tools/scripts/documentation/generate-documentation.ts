/*
 * This script will inject the content of README-content.tmpl.md into all README.md files
 * found in the 'packages/sdks' and 'packages/plugins' directories and containing
 * the following comment:
 * <!--Insert template begin--> ... <!--Insert template end-->
 * <!--Insert badges begin--> ... <!--Insert badges end-->
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const pipe =
  (...fns: ((args: any) => any)[]) =>
  (x: any) =>
    fns.reduce((v, f) => f(v), x);

const tap = (fn: (arg: any) => void) => (x: any) => {
  fn(x);
  return x;
};

const pipeLog = (text: string) => (x: any) => {
  console.log(text);
  return x;
};

const replaceTemplate = (contentToInject: string) => (text: string) =>
  text.replace(
    /<!--Insert template begin-->[\s\S]*<!--Insert template end-->/,
    `<!--Insert template begin-->\n<!--GENERATED TEXT - DO NOT EDIT HERE -->\n${contentToInject}\n<!--Insert template end-->`
  );

const replaceBadges = (npmBadgesTemplateContent: string) => (text: string) =>
  text.replace(
    /<!--Insert badges begin-->[\s\S]*<!--Insert badges end-->/,
    `<!--Insert badges begin-->\n<!--GENERATED TEXT - DO NOT EDIT HERE -->\n${npmBadgesTemplateContent}\n<!--Insert badges end-->`
  );

const replaceTitleWithPackageName = (packageName: string) => (text: string) => {
  return packageName ? text.replace(/^# .*/, `# ${packageName}`) : text;
};

/**
 * Search for README.md files in 'packages', specifically in 'sdks' and 'plugins' directory.
 * @returns {string[]} Full paths to all README.md files found.
 */
const findAllReadmeFiles = (): string[] => {
  const readmeFiles = execSync(
    `find packages/{sdks,plugins} -type f -iname "README.md"`
  )
    .toString()
    .split('\n')
    .filter((filePath) => filePath);

  return readmeFiles;
};

/**
 * Read content from README-content.tmpl.md.
 * @throws Will throw an error if README-content.tmpl.md file is not found.
 * @returns {string} String with template content or empty string if file not found.
 */
const readTemplateContent = (): string => {
  const templatePath = path.join(__dirname, './README-content.tmpl.md');

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `README-content.tmpl.md not found at path: ${templatePath}`
    );
  }

  return fs.readFileSync(templatePath, 'utf-8');
};

/**
 * Read content from README-npm-badges.tmpl.md.
 * @throws Will throw an error if README-npm-badges.tmpl.md file is not found.
 * @returns {string} String with template content or empty string if file not found.
 */
const readNPMBadgesTemplateContent = (): string => {
  const templatePath = path.join(__dirname, './README-npm-badges.tmpl.md');

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `README-content.tmpl.md not found at path: ${templatePath}`
    );
  }

  return fs.readFileSync(templatePath, 'utf-8');
};

/**
 * Extracts the 'name' from the package.json file in the same directory as the README.md file.
 * @param {string} readmePath - The path to the README.md file.
 * @returns {string} The name property from the package.json file.
 */
const extractPackageName = (readmePath: string): string => {
  const directoryPath = path.dirname(readmePath);
  const packageJsonPath = `${directoryPath}/package.json`;

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`[!] No package.json file found at ${packageJsonPath}`);
    return '';
  }

  const packageJsonData = fs.readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonData);

  return packageJson.name || '';
};

/**
 * Insert template content into a README.md file.
 * @param {string} pathToReadme - Path to the target README.md file.
 * @param {string} templateContent - Content to be injected into README.md file.
 * @throws Will throw an error if README.md file is not found on provided path.
 * @returns {string} String with final README.md file content.
 */
const insertTemplateIntoReadme = (
  pathToReadme: string,
  templateContent: string,
  npmBadgesTemplateContent: string,
  packageName: string
) => {
  let contentToInject = templateContent;

  console.log(`[+] Inserting template into ${pathToReadme}`);

  const readmePath = path.join(__dirname, '../../../', pathToReadme);
  if (!fs.existsSync(readmePath)) {
    throw new Error(`No README.md file found at the path: ${readmePath}`);
  }

  if (packageName && npmBadgesTemplateContent) {
    console.log(
      `[+] NPM package ${packageName} found. Adding badges to template.`
    );
    npmBadgesTemplateContent = npmBadgesTemplateContent.replace(
      /{NPM_PACKAGE_NAME}/g,
      packageName
    );
  }

  pipe(
    replaceTemplate(contentToInject),
    replaceBadges(npmBadgesTemplateContent),
    replaceTitleWithPackageName(packageName),
    (markdown: string) => fs.writeFileSync(readmePath, markdown)
  )(fs.readFileSync(readmePath, 'utf-8'));
};

/*
 * Main script execution
 */
try {
  const templateContent = readTemplateContent();
  const npmBadgesTemplateContent = readNPMBadgesTemplateContent();

  findAllReadmeFiles().forEach((readmePath) => {
    const packageName = extractPackageName(readmePath);
    insertTemplateIntoReadme(
      readmePath,
      templateContent,
      npmBadgesTemplateContent,
      packageName
    );
  });

  console.log('\n[✔️] documentation generated');
} catch (error) {
  console.error('[-] Error while generating documentation:', error);
  process.exit(1);
}

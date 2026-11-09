import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = __dirname;
const isDryRun = process.argv.includes('--dry-run');

console.log(`[GitHub Packages Publish] Initiating ${isDryRun ? 'dry-run ' : ''}publish for @ayushcmd/dinoloader...`);

// 1. Stage assets
execSync('node stage.js', { cwd: pkgDir, stdio: 'inherit' });

// 2. Check registry configuration
const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
if (pkgJson.name !== '@ayushcmd/dinoloader') {
  console.error('[Safety Error] Package name must be @ayushcmd/dinoloader');
  process.exit(1);
}

if (pkgJson.publishConfig?.registry !== 'https://npm.pkg.github.com') {
  console.error('[Safety Error] publishConfig.registry must be https://npm.pkg.github.com');
  process.exit(1);
}

// 3. Configure local .npmrc for GitHub Packages if not present
const npmrcPath = path.join(pkgDir, '.npmrc');
const hasEnvToken = Boolean(process.env.GITHUB_TOKEN || process.env.NODE_AUTH_TOKEN);
const hasNpmrc = fs.existsSync(npmrcPath);

if (!hasNpmrc && !hasEnvToken) {
  console.log('\n-------------------------------------------------------------');
  console.log('GitHub Packages Authentication Required:');
  console.log('To publish @ayushcmd/dinoloader to GitHub Packages, either:');
  console.log('1. Set GITHUB_TOKEN environment variable with "write:packages" scope:');
  console.log('   $env:GITHUB_TOKEN = "<your_github_pat>"');
  console.log('2. Or create a local .npmrc in this directory with:');
  console.log('   @ayushcmd:registry=https://npm.pkg.github.com');
  console.log('   //npm.pkg.github.com/:_authToken=<your_github_pat>');
  console.log('-------------------------------------------------------------\n');
}

if (!hasNpmrc && hasEnvToken) {
  const tokenVar = process.env.GITHUB_TOKEN ? 'GITHUB_TOKEN' : 'NODE_AUTH_TOKEN';
  const npmrcContent = `@ayushcmd:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=\${${tokenVar}}\n`;
  fs.writeFileSync(npmrcPath, npmrcContent, 'utf8');
  console.log(`✓ Configured local .npmrc referencing \${${tokenVar}} (git-ignored)`);
}

// 4. Execute publish command
const publishCmd = `npm publish --registry=https://npm.pkg.github.com${isDryRun ? ' --dry-run' : ''}`;
console.log(`Executing: ${publishCmd}\n`);

try {
  execSync(publishCmd, { cwd: pkgDir, stdio: 'inherit' });
  console.log(`\n✓ ${isDryRun ? 'Dry-run publication' : 'Publication'} succeeded!`);
} catch (err) {
  console.error('\n✗ Publication command failed. See output above.');
  process.exit(1);
}

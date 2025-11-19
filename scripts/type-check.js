#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync, existsSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

/**
 * 获取所有 workspace 包的信息
 */
function getAllPackages() {
  const rootDir = process.cwd();
  const packages = [];
  
  // 扫描 apps 目录
  const appsDir = join(rootDir, 'apps');
  if (existsSync(appsDir)) {
    try {
      const entries = readdirSync(appsDir);
      for (const entry of entries) {
        const appPath = join('apps', entry);
        const fullPath = join(rootDir, appPath);
        if (statSync(fullPath).isDirectory()) {
          const pkgJsonPath = join(fullPath, 'package.json');
          if (existsSync(pkgJsonPath)) {
            try {
              const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
              packages.push({
                name: pkgJson.name || appPath,
                path: appPath,
                hasTypeCheck: !!(pkgJson.scripts && pkgJson.scripts['type-check'])
              });
            } catch (e) {
              // 忽略无法解析的包
            }
          }
        }
      }
    } catch (e) {
      // 忽略读取错误
    }
  }
  
  // 扫描 packages 目录
  const packagesDir = join(rootDir, 'packages');
  if (existsSync(packagesDir)) {
    try {
      const entries = readdirSync(packagesDir);
      for (const entry of entries) {
        const pkgPath = join('packages', entry);
        const fullPath = join(rootDir, pkgPath);
        if (statSync(fullPath).isDirectory()) {
          const pkgJsonPath = join(fullPath, 'package.json');
          if (existsSync(pkgJsonPath)) {
            try {
              const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
              packages.push({
                name: pkgJson.name || pkgPath,
                path: pkgPath,
                hasTypeCheck: !!(pkgJson.scripts && pkgJson.scripts['type-check'])
              });
            } catch (e) {
              // 忽略无法解析的包
            }
          }
        }
      }
    } catch (e) {
      // 忽略读取错误
    }
  }
  
  return packages;
}

/**
 * 获取 git 变更的文件列表
 * 优先检查 staged 文件，如果没有则检查工作区变更
 */
function getChangedFiles() {
  try {
    // 先检查 staged 文件
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd()
    }).trim();
    
    if (staged) {
      return staged.split('\n').filter(Boolean);
    }
    
    // 如果没有 staged 文件，检查工作区变更
    const working = execSync('git diff --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd()
    }).trim();
    
    return working ? working.split('\n').filter(Boolean) : [];
  } catch (error) {
    // 如果不在 git 仓库中，返回空数组
    return [];
  }
}

/**
 * 根据变更文件确定哪些包需要检查
 */
function getAffectedPackages(changedFiles, packages) {
  const affectedPaths = new Set();
  
  for (const file of changedFiles) {
    // 找到包含该文件的包
    for (const pkg of packages) {
      // 检查文件是否属于这个包
      if (file.startsWith(pkg.path + '/') || file === pkg.path) {
        affectedPaths.add(pkg.path);
        break;
      }
    }
  }
  
  // 根据路径找到对应的包对象，并过滤出有 type-check 脚本的包
  return packages.filter(pkg => affectedPaths.has(pkg.path) && pkg.hasTypeCheck);
}

/**
 * 执行 type-check
 */
function runTypeCheck(packages) {
  if (packages.length === 0) {
    console.log('✅ No packages need type-checking');
    return true;
  }
  
  console.log(`\n🔍 Running type-check for ${packages.length} package(s):\n`);
  packages.forEach(pkg => {
    console.log(`  - ${pkg.name} (${pkg.path})`);
  });
  console.log('');
  
  let allPassed = true;
  const failedPackages = [];
  
  for (const pkg of packages) {
    try {
      console.log(`\n📦 Type-checking ${pkg.name}...`);
      execSync('pnpm --filter ' + pkg.name + ' type-check', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(`✅ ${pkg.name} passed\n`);
    } catch (error) {
      console.error(`❌ ${pkg.name} failed\n`);
      allPassed = false;
      failedPackages.push(pkg.name);
    }
  }
  
  if (!allPassed) {
    console.error('\n❌ Type-check failed for:');
    failedPackages.forEach(name => console.error(`  - ${name}`));
  }
  
  return allPassed;
}

/**
 * 主函数
 */
function main() {
  const packages = getAllPackages();
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log('✅ No changed files detected');
    process.exit(0);
  }
  
  const affectedPackages = getAffectedPackages(changedFiles, packages);
  
  if (affectedPackages.length === 0) {
    console.log('✅ No affected packages with type-check script found');
    process.exit(0);
  }
  
  const success = runTypeCheck(affectedPackages);
  process.exit(success ? 0 : 1);
}

main();


#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const versionType = process.argv[2] || 'patch';

// 读取当前版本号
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// 计算新版本号
function calculateNewVersion(type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// 确认提示
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function publish() {
  const newVersion = calculateNewVersion(versionType);
  
  console.log(`\n📦 当前版本: ${currentVersion}`);
  console.log(`📦 新版本: ${newVersion} (${versionType})`);
  console.log(`\n⚠️  即将执行以下操作:`);
  console.log(`   1. 更新版本号: ${currentVersion} -> ${newVersion}`);
  console.log(`   2. 构建项目`);
  console.log(`   3. 发布到 npm\n`);

  const confirmed = await askQuestion('确认继续? (y/n): ');
  
  if (!confirmed) {
    console.log('❌ 已取消发布');
    process.exit(0);
  }

  try {
    // 1. 更新版本号
    console.log('\n📦 更新版本号...');
    execSync(`node ${path.join(__dirname, 'bump-version.js')} ${versionType}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    // 2. 构建
    console.log('\n🔨 构建项目...');
    execSync('npm run build', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    // 3. 发布
    console.log('\n📤 发布到 npm...');
    execSync('npm publish --access public', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    // 4. commit and push
    execSync('git add package.json', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('\n✅ 发布成功！');
  } catch (error) {
    console.error('\n❌ 发布失败:', error.message);
    process.exit(1);
  }
}

publish();


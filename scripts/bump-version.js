#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 更新 package.json 版本号
 * @param {string} type - 版本类型: 'patch', 'minor', 'major' 或具体的版本号如 '1.2.3'
 */
function bumpVersion(type = 'patch') {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const currentVersion = packageJson.version;
  let newVersion;
  
  if (/^\d+\.\d+\.\d+$/.test(type)) {
    newVersion = type;
  } else {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
  }
  
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`版本号已更新: ${currentVersion} -> ${newVersion}`);
  return newVersion;
}

// 从命令行参数获取版本类型
const versionType = process.argv[2] || 'patch';
bumpVersion(versionType);


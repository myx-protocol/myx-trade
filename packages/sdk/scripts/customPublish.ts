import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path'

const commitVersionUpdate = (publishTag = 'main', versionType = 'patch') => {
    execSync('git add package.json', {
        stdio: 'inherit',
    });
    const packageJson = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    const latestVersion = packageJson.version as string;
    execSync(`git commit -m "chore: bump version v${latestVersion}"`, {
        stdio: 'inherit',
    });

    execSync('git push', {
        stdio: 'inherit',
    });
    return latestVersion;

}

const updateVersion = (publishType = 'main', versionType = 'patch') => {
    if (publishType === 'beta') {
        execSync('pnpm version prerelease --preid=beta')
    } else {
        execSync(`pnpm version ${versionType}`)
    }
}


inquirer.prompt([
    {
        type: 'select',
        name: 'publishTag',
        message: '请选择发布标签(main: 正式, beta: 测试)',
        default: 'main',
        choices: [
            {
                name: 'Main',
                value: 'main',
            },
            {
                name: 'Beta',
                value: 'beta',
            }
        ],
    }, {
        type: 'select',
        name: 'versionType',
        message: '请选择版本类型(patch: 补丁, minor: 小版本, major: 大版本)',
        default: 'patch',
        when: answers => answers.publishTag === 'main',
        choices: [
            {
                name: '补丁版本(patch)',
                value: 'patch',
            },
            {
                name: '次版本(minor)',
                value: 'minor',
            },
            {
                name: '主版本(major)',
                value: 'major',
            },
        ],
    }
]).then((answers) => {
    const { publishTag, versionType } = answers;
    updateVersion(publishTag, versionType)
    const latestVersion = commitVersionUpdate(publishTag, versionType);

    if (publishTag === 'beta') {
        execSync('pnpm publish --tag beta', {
            stdio: 'inherit',
        })
    } else {
        execSync('pnpm publish', {
            stdio: 'inherit',
        })
    }

    console.log('✅ 发布成功！')
    console.log(`🚀 最新版本: v${latestVersion}`)
});
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path'

const npmRegistry = 'https://registry.npmjs.org';

const commitVersionUpdate = (publishTag = 'main', versionType = 'patch') => {
    execSync('git add package.json', {
        stdio: 'inherit',
    });
    const packageJson = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    const latestVersion = packageJson.version as string;
    execSync(`git commit -m "chore: bump version v${latestVersion}"`, {
        stdio: 'inherit',
    });
    console.log('✅ 提交 commit 成功！')
    return latestVersion;

}

const pushCommit = () => {
    try {
        execSync('git push', {
            stdio: 'inherit',
        });
        console.log('✅ 推送 commit 成功！')
    } catch (error) {
        console.error('🚨 推送 commit 失败, 请手动执行 git push', error);
        return false;
    }
    return true;
}

const updateVersion = (publishType = 'main', versionType = 'patch') => {
    if (publishType === 'beta') {
        execSync('pnpm version prerelease --preid=beta')
    } else {
        execSync(`pnpm version ${versionType}`)
    }
}

const checkNPMLogined = async () => {
    try {
        execSync(`pnpm whoami --registry=${npmRegistry}`, {
            stdio: 'inherit',
        });
        return true
    } catch (error) {
        return false
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
]).then(async (answers) => {
    const { publishTag, versionType } = answers;
    updateVersion(publishTag, versionType)
    const latestVersion = commitVersionUpdate(publishTag, versionType);

    const isLoggedIn = await checkNPMLogined();
    if (!isLoggedIn) {
        console.log('🚨 检测到未登录 npm，先登录 npm')
        execSync(`pnpm login --registry=${npmRegistry}`, {
            stdio: 'inherit',
        });
        console.log('✅ pnpm registry 登录成功！')
    } else {
        console.log('🔄 pnpm registry 无需登录！')
    }

    if (publishTag === 'beta') {
        execSync('pnpm publish --tag beta', {
            stdio: 'inherit',
        })
    } else {
        execSync('pnpm publish', {
            stdio: 'inherit',
        })
    }
    const isPushed = pushCommit();
    if (!isPushed) {
        console.log('🚨 推送 commit 失败, 请手动执行 git push')
    }
    console.log('✅ 发布成功！')
    console.log(`🚀 最新版本: v${latestVersion}`)
})
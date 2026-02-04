import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path'

const PUBLISH_BRANCH = 'release/sdk'

const npmRegistry = 'https://registry.npmjs.org';

const checkBranch = () => {
    try {
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8',
        }).trim();

        if (currentBranch !== PUBLISH_BRANCH) {
            console.error(`🚨 错误: 当前分支 "${currentBranch}" 与发布分支 "${PUBLISH_BRANCH}" 不一致！`);
            console.error(`请切换到 ${PUBLISH_BRANCH} 分支后再执行发布操作。`);
            process.exit(1);
        }

        console.log(`✅ 当前分支检查通过: ${currentBranch}`);
    } catch (error) {
        console.error('🚨 检测分支时出错:', error);
        process.exit(1);
    }
}

const checkGitRemote = () => {
    try {
        // 拉取最新远程信息
        execSync('git fetch', {
            stdio: 'inherit',
        });

        // 比较本地分支与远程分支的提交数量
        // 格式："<remote_ahead>\t<local_ahead>"
        const result = execSync(
            `git rev-list --left-right --count origin/${PUBLISH_BRANCH}...${PUBLISH_BRANCH}`,
            {
                encoding: 'utf-8',
            },
        ).trim();

        const [remoteAheadStr] = result.split('\t');
        const remoteAhead = parseInt(remoteAheadStr, 10);

        if (Number.isNaN(remoteAhead)) {
            console.error('🚨 无法解析远程分支提交差异结果:', result);
            process.exit(1);
        }

        if (remoteAhead > 0) {
            console.error('🚨 检测到远程分支有未拉取的提交，请先执行 `git pull` 再发布。');
            process.exit(1);
        }

        console.log('✅ 远程分支已是最新，无未拉取提交。');
        return true;
    } catch (error) {
        console.error('🚨 检测远程仓库状态失败:', error);
        process.exit(1);
    }
}

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

checkBranch();
checkGitRemote();

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
        execSync(`pnpm publish --tag beta --publish-branch ${PUBLISH_BRANCH}`, {
            stdio: 'inherit',
        })
    } else {
        execSync(`pnpm publish --publish-branch ${PUBLISH_BRANCH}`, {
            stdio: 'inherit',
        })
    }
    const isPushed = pushCommit();
    if (!isPushed) {
        console.log('🚨 推送 commit 失败, 请手动执行 git push')
    }
    console.log('✅ 发布成功！')
    console.log(`🚀 最新版本: v${latestVersion}`)
}).catch(err => {
    console.error('🚨 发布失败:', err);
    process.exit(1);
})
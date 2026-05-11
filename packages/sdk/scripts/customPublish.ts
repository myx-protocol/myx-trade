import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path'

import ora from 'ora';

/** 当前 ora 实例，便于 SIGINT 时停掉转圈，避免终端残留一半输出 */
let activeSpinner: ReturnType<typeof ora> | null = null;

const loadingAdapter = async <T = any>(message: string, fn: () => T | Promise<T>): Promise<T> => {
    const spinner = ora(message).start();
    activeSpinner = spinner;
    try {
        const result = await fn();
        spinner.succeed();
        return result;
    } catch (error) {
        spinner.fail();
        throw error;
    } finally {
        spinner.stop();
        activeSpinner = null;
    }
}

/** 用户中断（如 inquirer 取消、子进程被 SIGINT 结束） */
const isUserInterrupted = (err: unknown): boolean => {
    if (typeof err !== 'object' || err === null) return false;
    const e = err as { name?: string; signal?: string };
    if (e.name === 'ExitPromptError') return true;
    if (e.signal === 'SIGINT') return true;
    return false;
};

/** 终端里按 Ctrl+C 会收到 SIGINT（macOS 终端里「复制」一般是 Cmd+C，不是中断） */
const installCancelOnInterrupt = () => {
    const onSigint = () => {
        try {
            activeSpinner?.stop();
        } catch {
            // ignore
        }
        activeSpinner = null;
        console.error('\n⚠️ 已取消发布（收到中断信号，一般为终端中的 Ctrl+C）。');
        process.exit(130);
    };
    process.on('SIGINT', onSigint);
    return () => {
        process.removeListener('SIGINT', onSigint);
    };
};

const teardownInterrupt = installCancelOnInterrupt();

const PUBLISH_BRANCH = 'release/sdk'

const npmRegistry = 'https://registry.npmjs.org';

/** 脚本里 stdio 是 pipe，没有终端给 Git 弹用户名/密码；设为 0 避免 HTTPS 无凭证时一直卡住 */
const gitNonInteractiveEnv = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
} as NodeJS.ProcessEnv;

const checkBranch = () => {
    try {
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8',
        }).trim();

        if (currentBranch !== PUBLISH_BRANCH) {
            console.error(`🚨 Error: current branch "${currentBranch}" is different from publish branch "${PUBLISH_BRANCH}"!`);
            console.error(`Please switch to branch ${PUBLISH_BRANCH} before running the publish command.`);
            process.exit(1);
        }
        console.log(`✅ Current branch check passed: ${currentBranch}`);

    } catch (error) {
        console.error('🚨 Error while checking branch:', error);
        process.exit(1);
    }
}

const checkGitRemote = () => {
    try {
        // Fetch latest remote information (silent, no console output)
        execSync('git fetch', {
            encoding: 'utf-8',
            stdio: 'pipe',
            env: gitNonInteractiveEnv,
        });

        // Compare commit counts between local and remote branches
        // Format: "<remote_ahead>\t<local_ahead>"
        const result = execSync(
            `git rev-list --left-right --count origin/${PUBLISH_BRANCH}...${PUBLISH_BRANCH}`,
            {
                encoding: 'utf-8',
                stdio: 'pipe',
                env: gitNonInteractiveEnv,
            },
        ).trim();

        const [remoteAheadStr] = result.split('\t');
        const remoteAhead = parseInt(remoteAheadStr, 10);

        if (Number.isNaN(remoteAhead)) {
            console.error('🚨 Failed to parse remote branch diff result:', result);
            process.exit(1);
        }

        if (remoteAhead > 0) {
            console.error('🚨 Detected unpulled commits on remote branch, please run `git pull` before publishing.');
            process.exit(1);
        }
        console.log('✅ Remote branch is up to date, no pending commits.');

        return true;
    } catch (error) {
        console.error('🚨 Failed to check remote repository status:', error);
        console.error(
            '💡 HTTPS 远程在本脚本里没有交互终端：请配置凭证（推荐 Git Credential Manager、`gh auth login`、或 PAT），',
            '或把 origin 改成 SSH（git@github.com:...）。也可先在 GitHub Desktop 里 fetch/push 一次，让系统凭证助手存好令牌。',
        );
        process.exit(1);
    }
}

const commitVersionUpdate = (publishTag = 'main', versionType = 'patch') => {
    execSync('git add package.json', {
        stdio: 'pipe',
    });
    const packageJson = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    const latestVersion = packageJson.version as string;
    execSync(`git commit -m "chore: bump version v${latestVersion}"`, {
        stdio: 'pipe',
    });
    console.log('✅ Commit created successfully!')
    return latestVersion;

}

const pushCommit = () => {
    try {
        execSync('git push', {
            stdio: 'pipe',
            env: gitNonInteractiveEnv,
        });
        console.log('✅ Commit pushed successfully!')
    } catch (error) {
        console.error('🚨 Failed to push commit, please run git push manually', error);
        return false;
    }
    return true;
}

const updateVersion = (publishType = 'main', versionType = 'patch') => {
    if (publishType === 'beta') {
        execSync('pnpm version prerelease --preid=beta', {
            stdio: 'pipe',
        })
    } else {
        execSync(`pnpm version ${versionType}`, {
            stdio: 'pipe',
        })
    }
}

const checkNPMLogined = async () => {
    try {
        execSync(`pnpm whoami --registry=${npmRegistry}`, {
            stdio: 'pipe',
        });
        return true
    } catch (error) {
        return false
    }
}

loadingAdapter('Checking publish branch', () => checkBranch())
    .then(() => loadingAdapter('Checking remote repository status', () => checkGitRemote()))
    .then(() => inquirer.prompt([
        {
            type: 'select',
            name: 'publishTag',
            message: 'Select publish tag (main: stable, beta: pre-release)',
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
            message: 'Select version type (patch, minor, major)',
            default: 'patch',
            when: answers => answers.publishTag === 'main',
            choices: [
                {
                    name: 'Patch version (patch)',
                    value: 'patch',
                },
                {
                    name: 'Minor version (minor)',
                    value: 'minor',
                },
                {
                    name: 'Major version (major)',
                    value: 'major',
                },
            ],
        }
    ])).then(async (answers) => {
        const { publishTag, versionType } = answers;
        updateVersion(publishTag, versionType)
        const latestVersion = commitVersionUpdate(publishTag, versionType);

        const isLoggedIn = await loadingAdapter('Checking npm login status', () => checkNPMLogined());
        if (!isLoggedIn) {
            console.log('🚨 npm is not logged in, logging in first')
            await loadingAdapter('Logging in to npm', () => execSync(`pnpm login --registry=${npmRegistry}`, {
                stdio: 'inherit',
            }));
            console.log('✅ Successfully logged into pnpm registry!')
        } else {
            console.log('🔄 No need to log in to pnpm registry')
        }

        if (publishTag === 'beta') {
            await loadingAdapter('Publishing beta version', () => execSync(`pnpm publish --tag beta --publish-branch ${PUBLISH_BRANCH} --registry=${npmRegistry}`, {
                stdio: 'inherit',
            }));
        } else {
            await loadingAdapter('Publishing main version', () => execSync(`pnpm publish --publish-branch ${PUBLISH_BRANCH} --registry=${npmRegistry}`, {
                stdio: 'inherit',
            }));
        }
        const isPushed = await loadingAdapter('Pushing commit', () => pushCommit());
        if (!isPushed) {
            console.log('🚨 Failed to push commit, please run git push manually')
        }
        console.log('✅ Publish succeeded!')
        console.log(`🚀 Latest version: v${latestVersion}`)
    })
    .catch(err => {
        if (isUserInterrupted(err)) {
            console.error('\n⚠️ 已取消发布。');
            process.exit(130);
        }
        console.error('🚨 Publish failed:', err);
        process.exit(1);
    })
    .finally(() => {
        teardownInterrupt();
    });
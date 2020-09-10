const Git = require('simple-git')

function isAsyncCall(fn) {
    /* eslint-disable */
    return (/^[^\)]+then\s*\)/).test(fn) || (/\._run\(/).test(fn)
}

let cacheGit, cacheRootPath
export default function(context,rootPath) {

    if (cacheRootPath === rootPath && cacheGit) {
        return cacheGit
    }
    cacheRootPath = rootPath

    const git = Git(rootPath)
    Object.keys(Object.getPrototypeOf(git)).forEach(key => {
        const fn = git[key]
        if (typeof fn === 'function' && isAsyncCall(fn)) {
            git[key] = function(...args) {
                return new Promise((resolve, reject) => {
                    if (args.length) {
                        if (args[0] === 'noToast') {
                            fn.call(git, ...args.slice(1), (err, result) => {
                                if (err) {
                                    reject(err)
                                }
                                resolve(result)
                            })
                            return
                        }
                    }
                    fn.call(git, ...args, (err, result) => {
                        if (err) {
                            context.$notify.error({
                                title: 'git报错，请自行解决',
                                message: err.toString(),
                                duration: 0
                            })
                            reject(err)
                        }
                        resolve(result)
                    })
                })
            }
        }
    })
    // 获取缺少的commit
    git.getMissingCommits = async function(conflictHash, conflictFiles, sourceBranch) {
        const lostCommits = {}
        for (let i = 0, len = conflictFiles.length; i < len; i++) {
            const file = conflictFiles[i]
            if (!file) continue
            console.log('冲突的文件', file)
            // 获取冲突文件 暂存区最后一次commit
            const stashCommit = (await git.log([
                '-n',
                1,
                file
            ])).latest
            // console.log('冲突文件最后一个commit', stashCommit)
            // 获取冲突文件 源分支所有commit
            const sourceBranchCommits = (await git.log([
                sourceBranch,
                file
            ])).all
            // console.log(sourceBranchCommits)
            // 倒序查找 在源分支commit中 找到暂存区最后一次commit
            let startRecord = false
            for (let j = 0, len2 = sourceBranchCommits.length; j < len2; j++) {
                const cur = sourceBranchCommits[j]
                if (startRecord) {
                    // 当前commit和冲突文件的最后一次commit 不是同一个commit 就认为是缺失的commit
                    // 只要 message、date、author_email 有一个不一样 就认为不是同一个commit
                    console.log('cur',cur);
                    if (!stashCommit || cur.message !== stashCommit.message || cur.date !== stashCommit.date || cur.author_email !== stashCommit.author_email) {
                        if (!lostCommits[cur.hash]) {
                            lostCommits[cur.hash] = cur
                        }
                    } else {
                        break
                    }
                } else if (cur.hash.startsWith(conflictHash)) { // 从冲突的commit开始 往后记录缺少的commit
                    startRecord = true
                }
            }
        }
        return Object.values(lostCommits)
    }
    // 判断工作区是否干净
    git.cleanConfirm = async function() {
        const data = await git.status()
        if (data.files.length) {
            context.$message.warning('暂存区不干净，请先提交所有改动')
            return false
        }
        return true
    }
    git.getCurBranch = async function(){
        let data = await git.raw(['symbolic-ref','--short','-q','HEAD'])
        // 去除换行 
       return data.replace(/[\r\n]/g,'')
    }

    cacheGit = git
    return git
}

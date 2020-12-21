<template>
    <div :class="s.pickList">
        <div :class="s.top">
            <div :class="s.group">
                <el-radio-group v-model="type"
                    @change="radioChange">
                    <el-radio-button label="strict">严格</el-radio-button>
                    <el-radio-button label="remote">远程</el-radio-button>
                    <el-radio-button label="local">本地</el-radio-button>
                </el-radio-group>
            </div>
            <div v-loading="branchLoading">
                <label style="margin-right: 12px;">迭代版本&nbsp;&nbsp;&nbsp;&nbsp;</label>
                <el-select v-model="version"
                    multiple
                    filterable
                    placeholder="请选择"
                    style="margin-right: 12px;">
                    <el-option v-for="item in projectStats"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
                <label style="margin-right: 12px;">源分支&nbsp;&nbsp;&nbsp;&nbsp;</label>
                <el-select v-model="sourceBranch"
                    filterable
                    @change="sourceBranchChange"
                    style="margin-right: 12px;">
                    <el-option v-for="(item,index) in sourceBranchList"
                        :key="index"
                        :disabled="item.disabled"
                        :label="item.label"
                        :value="item.value" />
                </el-select>
                <label style="margin-right: 12px;">目标分支&nbsp;&nbsp;&nbsp;&nbsp;</label>
                <el-select v-model="targetBranch"
                    filterable
                    @change="targetBranchChange"
                    style="margin-right: 12px;">
                    <el-option v-for="(item,index) in targetBranchList"
                        :key="index"
                        :disabled="item.disabled"
                        :label="item.label"
                        :value="item.value" />
                </el-select>

                <el-button :disabled="!(sourceBranch&&targetBranch)"
                    @click="getTreeList">
                    查询
                </el-button>
            </div>
        </div>
        <div :class="s.thead">
            <el-row>
                <el-col :span="4">
                    <p :class="s.text">迭代名称</p>
                </el-col>
                <el-col :span="2">
                    <p :class="s.text">commit数</p>
                </el-col>
                <el-col :span="4">
                    <p :class="s.text">开始时间</p>
                </el-col>
                <el-col :span="4">
                    <p :class="s.text">结束时间</p>
                </el-col>
                <el-col :span="10">
                    <p :class="s.text">说明</p>
                </el-col>
            </el-row>
        </div>
        <cherry-pick-tree ref="tree"
            v-loading="loading"
            :data="treeList"></cherry-pick-tree>
        <bottom-popup :maintainer="(type==='strict'||type==='remote')&&$route.query.maintainer"
            @submit="submit"
            @copy="copy"
            @cancel="$router.back()"></bottom-popup>
    </div>
</template>

<script>
import CherryPickTree from './components/CherryPickTree.vue';
import BottomPopup from './components/BottomPopup.vue';
import Git from '../git.js';
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
let git
export default {
    components: {
        BottomPopup,
        CherryPickTree,
    },
    data() {
        return {
            type: 'strict',
            branch: {
                all: [],
                branches: {},
                current: '',
                local: [],
                remotes: [],
            },
            targetBranch: '',
            sourceBranch: '',
            branchLoading: false,
            loading: false,
            diffStep: '',
            treeList: [],
            version: [],
            projectStats: [], //版本列表
            modal: {
                logs: false,
                submit: false
            },
            logs: []
        };
    },
    computed: {
        brancheList() {
            if (!this.branch.remotes.length) return []
            if (this.type === 'strict') return this.branch.remotes.filter(item => ['dev', 'test', 'master'].includes(item.replace('remotes/origin/', '')))
            if (this.type === 'remote') return this.branch.remotes
            return this.branch.local
        },
        sourceBranchList() {
            if (this.type === 'strict') {
                return this.brancheList.map(item => {
                    return {
                        value: item,
                        label: item,
                        disabled: item === 'remotes/origin/master'
                    }
                })
            }
            return this.brancheList.map(item => {
                return {
                    value: item,
                    label: item
                }
            })
        },
        targetBranchList() {
            if (this.type === 'strict') {
                return this.brancheList.map(item => {
                    return {
                        value: item,
                        label: item,
                        disabled: item === 'remotes/origin/dev'
                    }
                })
            }
            return this.brancheList.map(item => {
                return {
                    value: item,
                    label: item
                }
            })
        },

    },
    created() {
        this.init()
    },
    methods: {
        async init() {
            if (!this.$route.query.path) return
            git = Git(this, this.$route.query.path)
            // 拉取最新
            await git.fetch([
                'origin'
            ])
            // 获取分支
            this.branchLoading = true
            this.branch = await git.branch()
            this.branch.local = this.branch.all.filter(item => !item.startsWith('remotes'))
            this.branch.remotes = this.branch.all.filter(item => item.startsWith('remotes'))
            console.log('分支信息', this.branch)
            // 默认选择
            this.radioChange()
            this.getProjectStats();
            this.branchLoading = false
        },
        radioChange() {
            if (this.type === 'strict') {
                this.sourceBranch = 'remotes/origin/dev'
                this.targetBranch = 'remotes/origin/test'
                // 查询
                this.getTreeList()
            } else {
                this.sourceBranch = ''
                this.targetBranch = ''
                this.treeList = []
            }
        },
        sourceBranchChange() {
            if (this.type === 'strict') {
                if (this.sourceBranch === 'remotes/origin/dev') {
                    this.targetBranch = 'remotes/origin/test';
                }
                if (this.sourceBranch === 'remotes/origin/test') {
                    this.targetBranch = 'remotes/origin/master';
                }
                // 查询
                this.getTreeList()
            }
        },
        targetBranchChange() {
            if (this.type === 'strict') {
                if (this.targetBranch === 'remotes/origin/test') {
                    this.sourceBranch = 'remotes/origin/dev';
                }
                if (this.targetBranch === 'remotes/origin/master') {
                    this.sourceBranch = 'remotes/origin/test';
                }
                // 查询
                this.getTreeList()
            }
        },
        // 获取树
        async getTreeList() {
            if (!this.sourceBranch || !this.targetBranch) return this.$message.warning('请选择对比分支');
            this.loading = true
            const commits = await this.getDiffCommits();
            console.log('不同commits', commits);
            const candao = await this.getCantao()
            const parseList = candao.map((item, index) => {
                const relationCommits = commits.filter(list =>
                    list.isParse &&
                    list.tasks.every(task => item.tasks.includes(task))
                    && list.bugs.every(bug => item.bugs.includes(bug)))
                return {
                    ...item,
                    isExp: false,
                    hash: `index_${index}`,
                    num: relationCommits.length,
                    children: relationCommits.map(commit => {
                        return {
                            ...commit,
                            isExp: true
                        }
                    }).sort((x, y) => {
                        // 按时间排序
                        return new Date(x.date).getTime() > new Date(y.date).getTime() ? 1 : -1
                    })
                }
            })
            // 全部和蝉道关联上的
            let allRelationCommits = []
            parseList.forEach(item => {
                if (item.children && item.children.length) {
                    allRelationCommits.push(...item.children)
                }
            })
            // 取出没有关联到TB的commits
            const noRelationCommits = commits.filter(item => !allRelationCommits.map(list => list.hash).includes(item.hash))
            // 取出文档的
            const docCommit = noRelationCommits.filter(commit => (/^(doc|ext)/gui).test(commit.message))
            console.log('docCommit', docCommit);
            // 过滤掉文档的就是没有任何关联上的
            const errCommit = noRelationCommits.filter(commit => !docCommit.map(list => list.hash).includes(commit.hash))
            console.log('errCommit', errCommit);
            // 过滤
            this.treeList = [
                ...parseList,
                {
                    name: '***文档和拓展***',
                    num: docCommit.length,
                    isExp: false,
                    hash: `index_docCommit`,
                    disabled: false,
                    children: docCommit.map(commit => {
                        return {
                            ...commit,
                            disabled: false,
                            isExp: true
                        }
                    })
                },
                {
                    name: '***没有关联上的comit***',
                    num: errCommit.length,
                    isExp: false,
                    hash: `index_noRelationCommits`,
                    disabled: false,
                    children: errCommit.map(commit => {
                        return {
                            ...commit,
                            disabled: false,
                            isExp: true
                        }
                    })
                }
            ].filter(item => item.children && item.children.length)
            this.loading = false
            console.log('treeList', this.treeList);
        },
        // 获取项目迭代,由于全获取全部迭代再查询速度太慢了所以获取需要获取迭代自己选择
        async getProjectStats() {
            const {
                cantaoUrl,
                cantaoAccount,
                cantaoPassword
            } = this.$ctx.store.state.setting
            if (!cantaoUrl || !cantaoAccount || !cantaoPassword) {
                this.$router.push('/setting')
                this.$message.error('请设置蝉道')
                return
            }
            await this.$ctx.apiCantao.get('/index.php?m=api&f=getSessionID&t=json')
            // 退出登录
            await this.$ctx.apiCantao.get('/index.php?m=user&f=logout&t=json')
            // 登录
            await this.$ctx.apiCantao.post(`/index.php?m=user&f=login&t=json&account=${cantaoAccount}&password=${cantaoPassword}`)
            // 获取项目/产品
            const { projectStats, pager } = await this.$ctx.apiCantao.get('/index.php?m=project&f=all&status=undone&projectID=3&orderBy=order_desc&productID=0&recTotal=3&recPerPage=500&pageID=1&t=json')
            console.log('projectStats-pager', pager);
            console.log('projectStats', projectStats);
            this.projectStats = projectStats;
        },
        //获取蝉道数据
        async getCantao() {
            let versionList = []
            const projectStats = this.projectStats.filter(item=>this.version.includes(item.id));
            if (projectStats && !projectStats.length) return []
            for (let i = 0; i < projectStats.length; i++) {
                const project = projectStats[i]
                // const {
                //     tasks
                // } = await this.$ctx.apiCantao.get(`/index.php?m=project&f=task&projectID=${project.id}&status=all&param=0&orderBy=id_desc&recTotal=1&recPerPage=1000&pageID=1&t=json`)
                const {
                    tasks
                } = await this.$ctx.apiCantao.get(`/index.php?m=project&f=task&projectID=${project.id}&status=all&param=0&orderBy=&recTotal=2000&recPerPage=2000&pageID=1&type=all&t=json`)
                tasks
                console.log(`bugs${project.id}`, Object.keys(tasks).length);
                // const {
                //     tasks
                // } = await this.$ctx.apiCantao.get(`/project-task-${project.id}-unclosed-0--1-1000-1.json`)
                const {
                    bugs
                } = await this.$ctx.apiCantao.get(`/index.php?m=project&f=bug&projectID=${project.id}&orderBy=status,id_desc&build=0&type=all&param=0&recTotal=2000&recPerPage=2000&pageID=1&t=json`)
                console.log(`bugs${project.id}`, bugs.length);
                // const {
                //     bugs
                // } = await this.$ctx.apiCantao.get(`/project-bug-${project.id}-status,id_desc-0-all-0-1-1000-1.json`)
                const data = {
                    id: project.id,
                    name: project.name,
                    team: project.team,
                    desc: project.desc,
                    begin: project.begin,
                    end: project.end,
                    tasks: Object.keys(tasks).map(key => tasks[key]).map(task => Number(task.id)),
                    bugs: bugs.map(bug => Number(bug.id)),
                }
                versionList.push(data)
            }
            console.log('versionList', versionList);
            return versionList
        },
        // 获取两个分支差异
        async getDiffCommits() {
            // 获取最新远程代码
            const step1 = '获取远程最新代码'
            this.diffStep = step1
            console.time(step1)
            const source = this.sourceBranch.replace('remotes/origin/', '')
            const current = this.targetBranch.replace('remotes/origin/', '')
            await git.fetch([
                'origin',
                source,
                current
            ])
            console.timeEnd(step1)

            // diff commit
            const step2 = 'diff commits'
            this.diffStep = step2
            console.time(step2)
            console.log('当前对比', `${this.sourceBranch}...${this.targetBranch}`);
            const res = await git.log([
                '--cherry-pick',
                '--left-only',
                '--no-merges',
                `${this.sourceBranch}...${this.targetBranch}`
            ])
            console.log('res', res);
            const { all: commits } = res
            console.log('commits', commits);
            const parseCommits = commits.map(item => {
                const { message } = item
                const tasks = message.match(/T\d+/g) || [];
                const bugs = message.match(/B\d+/g) || [];
                return {
                    ...item,
                    isDoc: (/^(doc)/gui).test(message), // 是文档commit
                    isParse: tasks.length || bugs.length, // 是否可以解析任务和bug 的commit
                    tasks: tasks.map(item => Number(item.replace('T', ''))),
                    bugs: bugs.map(item => Number(item.replace('B', ''))),
                }
            })
            return parseCommits
        },
        async submit(automator) {
            const checkCommitsList = this.$refs.tree.getCheckedNodes()
                .filter(list => !list.hash.includes('index_'));
            console.log('getCheckedNodes', checkCommitsList);
            if (!checkCommitsList.length) {
                this.$message.warning('请选择commit')
                return
            }
            const commits = checkCommitsList.map(commit => commit.hash);
            console.log('commits', commits);
            // 当前分支用于操作完了切换回当前
            const curBranch = await git.getCurBranch()
            console.log('获取当前分支', curBranch);
            const handler = async () => {
                if (await git.cleanConfirm()) {
                    try {
                        const current = this.targetBranch.replace('remotes/origin/', '')
                        // 切换目标分支
                        await git.checkout(current)
                        await git.reset([
                            '--hard',
                            `origin/${current}`
                        ])
                        this.modal.logs = true
                        await new Promise((resolve, reject) => {
                            // 将commit写入文件 解决windows下命令行长度限制
                            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pentakill-cherry-pick-list'))
                            const file = path.join(dir, 'commits')
                            fs.writeFileSync(file, commits.join('\n'))
                            const cat = process.platform === 'win32' ? 'type' : 'cat'
                            const command = `${cat} ${file} | git cherry-pick --stdin`
                            console.log(command)
                            this.logs = [command]
                            const p = exec(command, {
                                cwd: this.$route.query.path,
                                maxBuffer: Infinity
                            })
                            p.stdout.on('data', log => {
                                console.log('stdout', log);
                                this.logs.push(log)
                            })
                            p.stderr.on('data', log => {
                                if (log.includes('error')) {
                                    this.modal.logs = false
                                    reject(log)
                                } else {
                                    console.warn(log)
                                }
                            })
                            p.on('close', code => {
                                console.log('close', code)
                                resolve()
                            })
                        })
                        this.modal.logs = false

                        if (automator) {
                            await git.push()
                        } else {
                            // 本地pick就返回上一页
                            this.$router.back();
                        }
                        this.$message.success('操作成功')
                    } catch (e) {
                        console.warn(e)
                        await git.raw([
                            'cherry-pick',
                            '--abort'
                        ])
                        this.$notify.error({
                            title: 'git报错，请自行解决',
                            message: e.toString(),
                            duration: 3000
                        })
                    }
                }
            }
            if (automator) {
                this.$confirm('即将执行cherry-pick、push、run pipeline连贯操作，Are you ready？')
                    .then(async () => {
                        await handler()
                        // 切换回当前
                        console.log('切换回当前分支', curBranch);
                        await git.checkout(curBranch)
                        // 获取列表
                        this.getTreeList()
                    })
            } else {
                //this.loading.submit = true
                await handler()
                // 切换回当前
                console.log('切换回当前分支', curBranch);
                await git.checkout(curBranch)
                // this.loading.submit = false
            }
        },
        copy() {
            const commits = this.$refs.tree.getCheckedNodes().filter(item => item.hash.indexOf('index_') === -1)
            if (!commits.length) {
                this.$message.warning('请选择相应commit记录');
                return;
            }
            // 按提交时间排序，越早越前面
            commits.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime()).map(s => s.hash).join(' ');
            const message = `${commits.map(commit => commit.hash).join(' ')}`
            console.log(message);
            this.$ctx.util.copy(message)
            this.$message.success('成功复制到粘贴板');
        }
    }
};
</script>

<style lang="scss" module="s">
.pickList {
  min-width: 900px;
  padding: 12px 0 60px;
  .top {
    .group {
      margin-bottom: 16px;
    }
  }
  .thead {
    margin-top: 16px;
    padding-left: 45px;
    height: 40px;
    line-height: 40px;
    background: #f5f8fa;
  }
  .text {
    text-align: left;
  }
  .logs {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
  }
  .version {
    margin-bottom: 16px;
  }
}
</style>

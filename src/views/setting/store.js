const Store = require('electron-store');
const electronStore = new Store();
export default {
    namespaced: true,
    state: {
        gitlabUrl: null || electronStore.get('gitlabUrl'),
        gitlabToken: null|| electronStore.get('gitlabToken'),
        gitRootPath: null|| electronStore.get('gitRootPath'),
        cantaoUrl: null|| electronStore.get('cantaoUrl'),
        cantaoAccount: null|| electronStore.get('cantaoAccount'),
        cantaoPassword: null|| electronStore.get('cantaoPassword'),
    },
    mutations: {
        setGitlabUrl(state, val) {
            state.gitlabUrl = val
            // 存在本地，退出程序进来不用填写
            electronStore.set('gitlabUrl', val)
        },
        setGitlabToken(state, val) {
            state.gitlabToken = val
            electronStore.set('gitlabToken', val)
        },
        setGitRootPath(state, val) {
            state.gitRootPath = val
            electronStore.set('gitRootPath', val)
        },
        setCantaoUrl(state, val) {
            state.cantaoUrl = val
            electronStore.set('cantaoUrl', val)
        },
        setCantaoAccount(state, val) {
            state.cantaoAccount = val
            electronStore.set('cantaoAccount', val)
        },
        setCantaoPassword(state, val) {
            state.cantaoPassword = val
            electronStore.set('cantaoPassword', val)
        },
        reset(state){
            Object.keys(state).forEach(key=>{
                state[key] = null
                electronStore.delete(`${key}`)
            })
        }
    },
    actions: {

    },
    getters: {}
}
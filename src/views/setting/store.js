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
        uiUrl: null|| electronStore.get('uiUrl') || 'http://10.23.2.69:3104/guide/introduce',
        yapiUrl: null|| electronStore.get('yapiUrl') || 'http://106.75.233.62:3000',
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
        setUiUrl(state, val) {
            state.uiUrl = val
            electronStore.set('uiUrl', val)
        },
        setYapiUrl(state, val) {
            state.yapiUrl = val
            electronStore.set('yapiUrl', val)
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
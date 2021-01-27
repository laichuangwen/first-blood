const Store = require('electron-store');
const electronStore = new Store();
export default {
    namespaced: true,
    state: {
        yapiProjects: null || electronStore.get('yapiProjects') || [],
    },
    mutations: {
        setYapiProjects(state, val) {
            state.yapiProjects = val
            // 存在本地，退出程序进来不用填写
            electronStore.set('yapiProjects', val)
        }
    },
    getters: {}
}
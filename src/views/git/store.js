const Store = require('electron-store');
const electronStore = new Store();
export default {
    namespaced: true,
    state: {
        // 本地项目路径
        rootPathList: electronStore.get('rootPathList') ? electronStore.get('rootPathList') : [],
        // 是不是维护者
        maintainer: false,
    },
    mutations: {
        setRootPathList(state, val) {
            // 存在本地，退出程序进来不用填写
            state.rootPathList = val
            electronStore.set('rootPathList', val)
        },
        // 更新一条数据,没有就添加
        updateRootPathListOne(state, val) {
            const rootPathItem = state.rootPathList.find(item => item.id === val.id)
            if (rootPathItem) {
                // 更新数据
                const index = state.rootPathList.findIndex(item => item.id === val.id)
                state.rootPathList.splice(index, 1, val)
            } else {
                state.rootPathList.push(val)
            }
            // 保存
            electronStore.set('rootPathList', state.rootPathList)
        },
        // 删除路径
        deleteRootPathListOne(state, id) {

            const index = state.rootPathList.findIndex(item => item.id === id)
            console.log(index);
            if (index !== -1) {
                console.log(index);
                state.rootPathList.splice(index, 1)
                console.log('shnl', state.rootPathList);
                // 保存
                electronStore.set('rootPathList', state.rootPathList)
            }
        },
        setMaintainer(state, val) {
            state.maintainer = val
        },
    },
    actions: {

    },
    getters: {}
}
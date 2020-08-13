import vuex from 'vuex'

export default ({ Vue, VueOption }, option) => {
    Vue.use(vuex)
    const store = new vuex.Store({
        modules: {},
        actions: {},
        ...option
    })
    VueOption.store = store

    Vue.$ctx.store = store
    Vue.$ctx.vuex = vuex
}
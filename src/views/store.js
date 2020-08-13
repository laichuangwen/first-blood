export default {
    namespaced: true,
    state: {
        gitlabUserInfo: null,
    },
    mutations: {
        setGitlabUserInfo(state, val) {
            state.gitlabUserInfo = val
        }
    },
    actions: {
        async getGitlabUserInfo({ commit },that) {
            const {setting} = that.$store.state
            if(!setting) return 
            const {gitlabUrl,gitlabToken} = setting
            if(!gitlabUrl || !gitlabToken) return 
            try {
                // docs: https://docs.gitlab.com/ee/api/users.html#list-current-user-for-normal-users
                const data = await that.$ctx.apiGitlab.get('/api/v4/user')
                commit('setGitlabUserInfo', data)
            } catch (e) {
                console.log(e);
                that.$message.error('gitlab登录失败')
            }
        },
    },
    getters: {}
}
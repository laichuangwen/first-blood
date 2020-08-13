import axios from 'axios'

export default (Vue) => {
    const {
        gitlabUrl,
        gitlabToken,
    } = Vue.$ctx.store.state.setting
    const apiGitlab = axios.create({
        baseURL: gitlabUrl,
        headers: {
            'Content-type': 'application/json',
            'Private-Token': `${gitlabToken}` // http://{gitlab host}/help/api/README.md
        },
        adapter: require('axios/lib/adapters/http')
    })
    apiGitlab.interceptors.response.use(response => response.data.data ? JSON.parse(response.data.data) : response.data)
    return apiGitlab
}
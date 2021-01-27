import axios from 'axios'

export default (Vue) => {
    const {
        yapiUrl,
    } = Vue.$ctx.store.state.setting
    const apiYapi = axios.create({
        baseURL: yapiUrl,
        headers: {
            'Content-type': 'application/json',
        },
        adapter: require('axios/lib/adapters/http')
    })
    apiYapi.interceptors.response.use(response => response.data.data)
    return apiYapi
}
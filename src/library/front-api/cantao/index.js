import axios from 'axios'
export default (Vue) => {
    const {
        cantaoUrl,
    } = Vue.$ctx.store.state.setting
    const apiCantao = axios.create({
        baseURL: cantaoUrl,
        headers: {
            'Content-type': 'application/json',
        },
        adapter: require('axios/lib/adapters/xhr')
    })
    apiCantao.interceptors.response.use(response => response.data.data ? JSON.parse(response.data.data) : response.data)
    return apiCantao
}
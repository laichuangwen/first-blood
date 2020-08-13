import ElementUI from 'element-ui'
import './theme/index.css'
export default ({ Vue }) => {
    // 全局加载了
    Vue.use(ElementUI)
    Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }
}

export default ({Vue}) => {
    Vue.$ctx.apiGitlab = require('./gitlab').default(Vue)
    Vue.$ctx.apiCantao = require('./cantao').default(Vue)
}
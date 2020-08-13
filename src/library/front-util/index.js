import lodash from 'lodash'
import moment from 'moment'
import qs from 'qs'
import BigNumber from 'bignumber.js'

import Cookie from './cookie'
import SessionStorage from './sessionStorage'
import LocalStorage from './localStorage'
import md5 from './md5'
import context from './context'
import date from './date'
import {
    formatFileSize
} from './file'
import number from './number'
import string from './string'
import escapeData from './escapeData'

class Util {
    constructor(option) {
        Object.assign(this, {
            md5,
            ...context,
            ...date,
            ...number,
            ...string,
            escapeData,
            formatFileSize,
            BigNumber,
            lodash,
            moment,
            qs,
            cookie: new Cookie(option),
            sessionStorage: new SessionStorage(option),
            localStorage: new LocalStorage(option)
        })
    }

    static install({
        Vue
    }, option) {
        Vue.$ctx.util = new Util(option)
    }
}

export default (app, option) => {
    Util.install(app, option)
}
const routers = [{
        path: '/',
        component: require('./index.vue').default,
        redirect: 'setting',
        children: [{
                path: 'git',
                name: 'git',
                redirect: 'git/repository',
                component: require('./git/index.vue').default,
                children: [{
                        path: 'repository',
                        name: 'git.repository',
                        component: require('./git/repository/index.vue').default,
                    },
                    {
                        path: 'branch',
                        name: 'git.branch',
                        component: require('./git/branch/index.vue').default,
                        redirect: 'git/branch/list',
                        children: [{
                                path: 'list',
                                name: 'git.branch.list',
                                component: require('./git/branch/list/index.vue').default,
                            },
                            {
                                path: 'cherry-pick',
                                name: 'git.branch.cherry-pick',
                                component: require('./git/branch/cherry-pick/index.vue').default,
                            }
                        ]
                    }
                ]
            },
            {
                path: 'ui',
                name: 'ui',
                component: require('./ui/index.vue').default,
            },
            {
                path: 'yapi',
                name: 'yapi',
                component: require('./yapi/index.vue').default,
                redirect: 'yapi/project',
                children: [
                    {
                        path: 'project',
                        name: 'yapi.project',
                        component: require('./yapi/project/index.vue').default,
                    },
                    {
                        path: 'interface',
                        name: 'yapi.interface',
                        component: require('./yapi/interface/index.vue').default,
                    },
                    {
                        path: 'generate',
                        name: 'yapi.generate',
                        component: require('./yapi/generate/index.vue').default,
                    },
                ]
            },
            {
                path: 'setting',
                name: 'setting',
                component: require('./setting/index.vue').default,
            },
        ],
    },
    {
        path: '*',
        redirect: '/'
    }
]
export default routers
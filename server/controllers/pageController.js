const pageController = {
    // 登录页
    getLoginPage: (req, res) => {
        res.render('auth/login', { 
            layout: 'layouts/auth',
            title: '登录',
            user: null
        });
    },

    // 仪表板
    getDashboard: async (req, res) => {
        try {
            console.log('=== 仪表板页面请求 ===');
            console.log('认证用户:', req.user);

            res.render('dashboard/index', {
                title: '仪表盘',
                path: '/dashboard',
                user: req.user,
                layout: 'layouts/main'
            });
        } catch (error) {
            console.error('仪表板渲染错误:', error);
            res.redirect('/login');
        }
    },

    // 创建短链接页面
    getCreateUrl: (req, res) => {
        res.render('urls/create', { 
            title: '生成短链接',
            path: '/urls/create',
            layout: 'layouts/main',
            user: req.user
        });
    },

    // 注册页
    getRegisterPage: (req, res) => {
        res.render('auth/register', { 
            layout: 'layouts/auth',
            title: '注册',
            user: null
        });
    },

    // 短链接管理页面
    getUrlManage: (req, res) => {
        res.render('urls/manage', { 
            title: '短链接管理',
            path: '/urls/manage',
            layout: 'layouts/main',
            user: req.user
        });
    },

    // 用户管理页面
    getUserManage: (req, res) => {
        res.render('admin/users', {
            title: '用户管理',
            path: '/admin/users',
            user: req.user
        });
    }
};

module.exports = pageController; 
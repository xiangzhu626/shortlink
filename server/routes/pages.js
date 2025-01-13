const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const auth = require('../middleware/auth');

// 登录和注册页面 - 不需要认证
router.get('/login', pageController.getLoginPage);
router.get('/register', pageController.getRegisterPage);

// 首页重定向到登录页
router.get('/', (req, res) => {
    res.redirect('/login');
});

// 所有其他页面需要认证
router.use(auth);

// 仪表板
router.get('/dashboard', pageController.getDashboard);
router.get('/urls/create', pageController.getCreateUrl);
router.get('/urls/manage', pageController.getUrlManage);
router.get('/admin/users', pageController.getUserManage);

module.exports = router; 
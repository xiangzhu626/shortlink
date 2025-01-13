const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 注册路由
router.post('/register', async (req, res, next) => {
    try {
        await authController.register(req, res);
    } catch (error) {
        console.error('注册路由错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 登录路由
router.post('/login', async (req, res, next) => {
    try {
        await authController.login(req, res);
    } catch (error) {
        console.error('登录路由错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router; 
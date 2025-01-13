const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        console.log('=== 认证中间件开始 ===');
        console.log('请求路径:', req.path);
        console.log('请求方法:', req.method);
        console.log('Cookie:', req.cookies);

        const token = req.cookies.token;
        console.log('Token:', token ? '存在' : '不存在');

        if (!token) {
            console.log('未找到token，重定向到登录页');
            return res.redirect('/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token解析结果:', decoded);

            const user = await User.findById(decoded.id);
            console.log('查找到的用户:', user ? '存在' : '不存在');

            if (!user) {
                console.log('用户不存在，重定向到登录页');
                res.clearCookie('token');
                return res.redirect('/login');
            }

            // 将用户信息添加到请求对象
            req.user = user;
            console.log('认证成功，继续处理请求');
            return next();
        } catch (jwtError) {
            console.error('JWT验证失败:', jwtError.message);
            res.clearCookie('token');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('认证中间件错误:', error);
        return res.redirect('/login');
    }
}; 
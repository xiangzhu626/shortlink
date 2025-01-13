const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // 检查用户是否已存在
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: '用户名已存在' });
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);

            // 创建用户
            await User.create({
                username,
                email,
                password: hashedPassword
            });

            res.status(201).json({ message: '注册成功' });
        } catch (error) {
            console.error('注册错误:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log('登录请求:', { username });

            // 验证用户
            const user = await User.findByUsername(username);
            if (!user) {
                console.log('用户不存在');
                return res.status(401).json({ error: '用户名或密码错误' });
            }

            // 验证密码
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                console.log('密码错误');
                return res.status(401).json({ error: '用户名或密码错误' });
            }

            // 生成 token
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // 设置 cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000
            });

            // 返回成功响应
            return res.json({
                success: true,
                message: '登录成功',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('登录失败:', error);
            return res.status(500).json({ error: '登录失败，请稍后重试' });
        }
    }
};

module.exports = authController; 
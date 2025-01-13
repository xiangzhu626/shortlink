const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // 输入验证
            if (!username || !email || !password) {
                return res.status(400).json({ error: '所有字段都是必填的' });
            }

            // 检查用户名是否已存在
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: '用户名已存在' });
            }

            // 检查邮箱是否已存在
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ error: '邮箱已被注册' });
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);

            // 创建用户
            const userId = await User.create({
                username,
                email,
                password: hashedPassword
            });

            console.log('用户创建成功, ID:', userId);
            res.status(201).json({ message: '注册成功' });
        } catch (error) {
            console.error('注册错误:', error);
            // 更具体的错误信息
            if (error.code === 'SQLITE_CONSTRAINT') {
                res.status(400).json({ error: '邮箱已被注册' });
            } else {
                res.status(500).json({ error: '服务器错误' });
            }
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // 输入验证
            if (!username || !password) {
                return res.status(400).json({ error: '用户名和密码都是必填的' });
            }

            // 验证用户
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: '用户名或密码错误' });
            }

            // 验证密码
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: '用户名或密码错误' });
            }

            // 生成 token
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // 返回成功响应
            return res.json({
                success: true,
                message: '登录成功',
                token,
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
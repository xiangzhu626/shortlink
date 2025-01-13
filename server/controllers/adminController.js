const bcrypt = require('bcryptjs');
const User = require('../models/User');

const adminController = {
    // 获取用户列表
    listUsers: async (req, res) => {
        try {
            const users = await User.findAll();
            res.json(users.map(user => ({
                ...user,
                password: undefined // 移除密码字段
            })));
        } catch (error) {
            console.error('获取用户列表失败:', error);
            res.status(500).json({ error: '获取用户列表失败' });
        }
    },

    // 创建用户
    createUser: async (req, res) => {
        try {
            const { username, email, password, role, status } = req.body;

            // 验证必填字段
            if (!username || !email || !password) {
                return res.status(400).json({ error: '缺少必要字段' });
            }

            // 检查用户名是否已存在
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: '用户名已存在' });
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);

            // 创建用户
            const userId = await User.create({
                username,
                email,
                password: hashedPassword,
                role: role || 'user',
                status: status || 'active'
            });

            console.info(`管理员 ${req.user.username} 创建了新用户 ${username}`);
            res.status(201).json({ id: userId, message: '用户创建成功' });
        } catch (error) {
            console.error('创建用户失败:', error);
            res.status(500).json({ error: '创建用户失败' });
        }
    },

    // 更新用户
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { email, role, status } = req.body;

            // 检查用户是否存在
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            // 更新用户信息
            await User.update(id, {
                email,
                role,
                status
            });

            console.info(`管理员 ${req.user.username} 更新了用户 ${user.username} 的信息`);
            res.json({ message: '用户更新成功' });
        } catch (error) {
            console.error('更新用户失败:', error);
            res.status(500).json({ error: '更新用户失败' });
        }
    },

    // 删除用户
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // 检查用户是否存在
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            // 不允许删除自己
            if (id === req.user.id) {
                return res.status(400).json({ error: '不能删除当前登录的管理员账号' });
            }

            await User.delete(id);

            console.info(`管理员 ${req.user.username} 删除了用户 ${user.username}`);
            res.json({ message: '用户删除成功' });
        } catch (error) {
            console.error('删除用户失败:', error);
            res.status(500).json({ error: '删除用户失败' });
        }
    },

    // 重置用户密码
    resetPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({ error: '新密码不能为空' });
            }

            // 检查用户是否存在
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            // 加密新密码
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(id, hashedPassword);

            console.info(`管理员 ${req.user.username} 重置了用户 ${user.username} 的密码`);
            res.json({ message: '密码重置成功' });
        } catch (error) {
            console.error('重置密码失败:', error);
            res.status(500).json({ error: '重置密码失败' });
        }
    }
};

module.exports = adminController; 
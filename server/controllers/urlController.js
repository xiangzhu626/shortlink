const Url = require('../models/Url');

const urlController = {
    create: async (req, res) => {
        try {
            const { originalUrl, customCode, password, expiresAt } = req.body;
            const userId = req.user.id;

            console.log('接收到的数据:', {
                originalUrl,
                customCode,
                hasPassword: !!password,
                expiresAt,
                userId
            });

            // 验证URL格式
            try {
                const url = new URL(originalUrl);
                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    return res.status(400).json({ error: '仅支持 HTTP 和 HTTPS 协议' });
                }
            } catch (e) {
                return res.status(400).json({ error: '无效的URL格式，请确保包含 http:// 或 https://' });
            }

            // 如果提供了自定义短码，检查是否已存在
            if (customCode) {
                // 验证自定义短码格式
                if (!/^[A-Za-z0-9]{3,10}$/.test(customCode)) {
                    return res.status(400).json({ 
                        error: '自定义短码只能包含字母和数字，长度在3-10之间' 
                    });
                }

                const existing = await Url.findByShortCode(customCode);
                if (existing) {
                    return res.status(400).json({ error: '该短码已被使用' });
                }
            }

            const url = await Url.create({
                userId,
                originalUrl,
                customCode,
                password,
                expiresAt
            });

            console.log('创建成功:', url);

            res.status(201).json({
                shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
                shortCode: url.shortCode
            });
        } catch (error) {
            console.error('创建短链接错误:', error);
            res.status(500).json({ error: '服务器错误: ' + error.message });
        }
    },

    list: async (req, res) => {
        try {
            const userId = req.user.id;
            const urls = await Url.findByUserId(userId);
            
            const urlsWithStats = urls.map(url => ({
                ...url,
                shortUrl: `${process.env.BASE_URL}/${url.short_code}`
            }));

            res.json(urlsWithStats);
        } catch (error) {
            console.error('获取短链接列表错误:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    },

    redirect: async (req, res) => {
        try {
            const { shortCode } = req.params;
            const url = await Url.findByShortCode(shortCode);

            if (!url) {
                return res.status(404).send('链接不存在或已过期');
            }

            if (url.status !== 'active') {
                return res.status(403).send('链接已被禁用');
            }

            if (url.expires_at && new Date(url.expires_at) < new Date()) {
                return res.status(403).send('链接已过期');
            }

            // 记录访问
            try {
                await Url.recordVisit(
                    url.id,
                    req.ip,
                    req.headers['user-agent']
                );
            } catch (error) {
                console.error('记录访问失败:', error);
                // 继续重定向，即使记录失败
            }

            res.redirect(url.original_url);
        } catch (error) {
            console.error('重定向错误:', error);
            res.status(500).send('服务器错误');
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { password, expiresAt, status } = req.body;
            const userId = req.user.id;

            // 检查权限
            const url = await Url.findById(id);
            if (!url) {
                return res.status(404).json({ error: '短链接不存在' });
            }
            if (url.user_id !== userId) {
                return res.status(403).json({ error: '无权操作此短链接' });
            }

            // 更新短链接
            await Url.update(id, {
                password,
                expiresAt,
                status
            });

            res.json({ message: '更新成功' });
        } catch (error) {
            console.error('更新短链接错误:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // 检查权限
            const url = await Url.findById(id);
            if (!url) {
                return res.status(404).json({ error: '短链接不存在' });
            }
            if (url.user_id !== userId) {
                return res.status(403).json({ error: '无权操作此短链接' });
            }

            // 删除短链接
            await Url.delete(id);

            res.json({ message: '删除成功' });
        } catch (error) {
            console.error('删除短链接错误:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    }
};

module.exports = urlController; 
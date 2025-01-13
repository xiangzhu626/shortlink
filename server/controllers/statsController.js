const Url = require('../models/Url');

const statsController = {
    getDashboardStats: async (req, res) => {
        try {
            const userId = req.user.id;
            console.log('正在获取用户统计数据, userId:', userId);

            // 验证数据库结构
            await Url.validateDatabase();

            // 获取统计数据
            const stats = await Url.getStats(userId);
            console.log('基础统计数据:', stats);
            
            // 获取今日点击数
            const todayStats = await Url.getTodayStats(userId);
            console.log('今日统计数据:', todayStats);
            
            // 获取最近的链接
            const recentUrls = await Url.getRecentUrls(userId, 10);
            console.log('最近链接数据:', recentUrls);

            res.json({
                totalUrls: stats.totalUrls,
                todayClicks: todayStats.clicks,
                activeUrls: stats.activeUrls,
                recentUrls: recentUrls.map(url => ({
                    ...url,
                    shortUrl: `${process.env.BASE_URL}/${url.short_code}`
                }))
            });
        } catch (error) {
            console.error('获取仪表盘统计数据失败:', error);
            console.error('错误堆栈:', error.stack);
            res.status(500).json({ error: '获取统计数据失败' });
        }
    }
};

module.exports = statsController; 
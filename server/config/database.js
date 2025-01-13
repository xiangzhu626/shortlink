const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保在 Vercel 环境中使用 /tmp 目录
const dbPath = process.env.VERCEL 
    ? path.join('/tmp', 'shorturl.db')
    : path.resolve(__dirname, '../database/shorturl.db');

// 确保目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 将数据库操作包装为 Promise
const dbPromise = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
            console.error('数据库连接失败:', err);
            reject(err);
            return;
        }
        
        console.log('成功连接到SQLite数据库');
        try {
            // 同步等待数据库初始化
            const initDb = require('../scripts/init-db');
            await initDb(db);
            resolve(db);
        } catch (error) {
            console.error('数据库初始化失败:', error);
            reject(error);
        }
    });
});

// 导出一个函数，用于获取数据库实例
module.exports = async () => {
    return await dbPromise;
}; 
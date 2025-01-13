const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Vercel 环境使用内存数据库
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? ':memory:' : path.resolve(__dirname, '../database/shorturl.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('成功连接到SQLite数据库');
        // 在 Vercel 环境中自动初始化数据库
        if (isVercel) {
            require('../scripts/init-db');
        }
    }
});

module.exports = db; 
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

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('成功连接到SQLite数据库');
        // 在连接成功后立即初始化数据库
        require('../scripts/init-db');
    }
});

module.exports = db; 
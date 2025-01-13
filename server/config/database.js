const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保在 Vercel 环境中使用持久化存储
const dbPath = process.env.VERCEL 
    ? '/tmp/data/shorturl.db'
    : path.resolve(__dirname, '../database/shorturl.db');

// 确保数据库目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 使用单例模式确保数据库连接的一致性
let dbInstance = null;

async function getDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, async (err) => {
            if (err) {
                console.error('数据库连接失败:', err);
                reject(err);
                return;
            }
            
            console.log('成功连接到SQLite数据库');
            try {
                const initDb = require('../scripts/init-db');
                await initDb(db);
                dbInstance = db;
                resolve(db);
            } catch (error) {
                console.error('数据库初始化失败:', error);
                reject(error);
            }
        });

        // 错误处理
        db.on('error', (err) => {
            console.error('数据库错误:', err);
            dbInstance = null;
        });
    });
}

// 导出获取数据库实例的函数
module.exports = getDatabase; 
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
    try {
        // 创建用户表
        await db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 创建短链接表
        await db.run(`CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            original_url TEXT NOT NULL,
            short_code TEXT UNIQUE NOT NULL,
            password TEXT,
            status TEXT DEFAULT 'active',
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // 创建访问记录表
        await db.run(`CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url_id INTEGER NOT NULL,
            visitor_ip TEXT,
            user_agent TEXT,
            visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (url_id) REFERENCES urls(id)
        )`);

        // 创建默认管理员账号
        const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                ['admin', 'admin@example.com', hashedPassword, 'admin']
            );
            console.log('默认管理员账号创建成功');
        }

        console.log('数据库初始化完成');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
    }
}

// 执行初始化
initDatabase().catch(console.error); 
const bcrypt = require('bcryptjs');

async function initDatabase(db) {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                // 创建用户表
                await new Promise((resolve, reject) => {
                    db.run(`CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        role TEXT DEFAULT 'user',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`, (err) => {
                        if (err) {
                            console.error('创建用户表失败:', err);
                            reject(err);
                        } else {
                            console.log('用户表创建成功');
                            resolve();
                        }
                    });
                });

                // 检查是否需要创建默认管理员
                const adminExists = await new Promise((resolve, reject) => {
                    db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });

                if (!adminExists) {
                    const hashedPassword = await bcrypt.hash('admin123', 10);
                    await new Promise((resolve, reject) => {
                        db.run(
                            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                            ['admin', 'admin@example.com', hashedPassword, 'admin'],
                            (err) => {
                                if (err) reject(err);
                                else {
                                    console.log('默认管理员账号创建成功');
                                    resolve();
                                }
                            }
                        );
                    });
                }

                console.log('数据库初始化完成');
                resolve();
            } catch (error) {
                console.error('数据库初始化失败:', error);
                reject(error);
            }
        });
    });
}

module.exports = initDatabase; 
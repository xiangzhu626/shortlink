const db = require('../../config/database');

function up() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 先检查 visits 表是否存在
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='visits'`, (err, row) => {
                if (err) {
                    console.error('检查表失败:', err);
                    reject(err);
                    return;
                }

                // 如果表不存在，创建它
                if (!row) {
                    db.run(`
                        CREATE TABLE visits (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            url_id INTEGER NOT NULL,
                            visitor_ip TEXT,
                            user_agent TEXT,
                            visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (url_id) REFERENCES urls(id)
                        )
                    `, (err) => {
                        if (err) {
                            console.error('创建访问记录表失败:', err);
                            reject(err);
                            return;
                        }

                        // 创建索引
                        db.run(`
                            CREATE INDEX IF NOT EXISTS idx_visits_url_id ON visits(url_id)
                        `, (err) => {
                            if (err) {
                                console.error('创建索引失败:', err);
                                reject(err);
                                return;
                            }

                            // 为 urls 表添加状态字段
                            db.run(`
                                ALTER TABLE urls ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
                            `, (err) => {
                                if (err) {
                                    console.error('添加状态字段失败:', err);
                                    reject(err);
                                    return;
                                }
                                resolve();
                            });
                        });
                    });
                } else {
                    // 表已存在，直接完成
                    resolve();
                }
            });
        });
    });
}

function down() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 删除访问记录表
            db.run(`DROP TABLE IF EXISTS visits`, (err) => {
                if (err) {
                    console.error('删除访问记录表失败:', err);
                    reject(err);
                    return;
                }
            });

            // 删除状态字段（SQLite不支持删除列，这里只是占位）
            resolve();
        });
    });
}

module.exports = {
    up,
    down
}; 
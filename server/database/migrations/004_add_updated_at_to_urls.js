const db = require('../../config/database');

function up() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 添加 updated_at 字段
            db.run(`
                ALTER TABLE urls 
                ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            `, (err) => {
                if (err) {
                    console.error('添加 updated_at 字段失败:', err);
                    reject(err);
                    return;
                }

                // 更新现有记录的 updated_at 字段
                db.run(`
                    UPDATE urls 
                    SET updated_at = created_at 
                    WHERE updated_at IS NULL
                `, (err) => {
                    if (err) {
                        console.error('更新现有记录失败:', err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    });
}

function down() {
    return new Promise((resolve, reject) => {
        // SQLite 不支持删除列，这里只是占位
        resolve();
    });
}

module.exports = {
    up,
    down
}; 
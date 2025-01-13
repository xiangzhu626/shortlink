const db = require('../config/database');
const crypto = require('crypto');

const Url = {
    generateShortCode: (length = 6) => {
        return crypto.randomBytes(length).toString('base64')
            .replace(/[+/=]/g, '')
            .substr(0, length);
    },

    create: (urlData) => {
        return new Promise((resolve, reject) => {
            const shortCode = urlData.customCode || Url.generateShortCode();
            db.run(
                `INSERT INTO urls (user_id, original_url, short_code, password, expires_at)
                VALUES (?, ?, ?, ?, ?)`,
                [urlData.userId, urlData.originalUrl, shortCode, urlData.password, urlData.expiresAt],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, shortCode });
                    }
                }
            );
        });
    },

    findByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    },

    findByShortCode: (shortCode) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM urls WHERE short_code = ?`,
                [shortCode],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    },

    updateStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE urls SET status = ? WHERE id = ?`,
                [status, id],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    },

    recordVisit: (urlId, visitorIp, userAgent) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO visits (url_id, visitor_ip, user_agent, visited_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [urlId, visitorIp, userAgent],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    },

    getStats: function(userId) {
        return new Promise((resolve, reject) => {
            // 先检查用户是否存在
            db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
                if (err) {
                    console.error('检查用户失败:', err);
                    reject(err);
                    return;
                }

                if (!user) {
                    reject(new Error('用户不存在'));
                    return;
                }

                // 获取统计数据
                db.get(`
                    SELECT 
                        COUNT(*) as totalUrls,
                        SUM(CASE WHEN status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now')) THEN 1 ELSE 0 END) as activeUrls
                    FROM urls 
                    WHERE user_id = ?
                `, [userId], (err, row) => {
                    if (err) {
                        console.error('获取URL统计失败:', err);
                        reject(err);
                        return;
                    }

                    resolve({
                        totalUrls: row ? row.totalUrls || 0 : 0,
                        activeUrls: row ? row.activeUrls || 0 : 0
                    });
                });
            });
        });
    },

    getRecentUrls: function(userId, limit = 5) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    u.*, 
                    COALESCE((SELECT COUNT(*) FROM visits v WHERE v.url_id = u.id), 0) as clicks
                FROM urls u
                WHERE u.user_id = ?
                ORDER BY u.created_at DESC
                LIMIT ?
            `, [userId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    },

    getTodayStats: function(userId) {
        return new Promise((resolve, reject) => {
            // 使用正确的列名 visited_at 而不是 created_at
            db.get(`
                SELECT COALESCE(COUNT(*), 0) as clicks
                FROM visits v
                JOIN urls u ON v.url_id = u.id
                WHERE u.user_id = ?
                AND DATE(v.visited_at) = DATE('now', 'localtime')
            `, [userId], (err, row) => {
                if (err) {
                    console.error('获取今日点击统计失败:', err);
                    reject(err);
                    return;
                }

                resolve({
                    clicks: row ? row.clicks || 0 : 0
                });
            });
        });
    },

    validateDatabase: function() {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // 检查 visits 表结构
                db.all(`PRAGMA table_info(visits)`, (err, columns) => {
                    if (err) {
                        console.error('检查visits表结构失败:', err);
                        reject(err);
                        return;
                    }
                    console.log('visits表列信息:', columns);

                    // 检查是否有数据
                    db.get(`SELECT COUNT(*) as count FROM visits`, (err, row) => {
                        if (err) {
                            console.error('检查visits表数据失败:', err);
                            reject(err);
                            return;
                        }
                        console.log('visits表数据数量:', row.count);
                        resolve();
                    });
                });
            });
        });
    },

    findById: function(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM urls WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    update: function(id, data) {
        return new Promise((resolve, reject) => {
            const { password, expiresAt, status } = data;
            db.run(
                `UPDATE urls 
                 SET password = ?, 
                     expires_at = ?, 
                     status = ?
                 WHERE id = ?`,
                [password, expiresAt, status, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    },

    delete: function(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM urls WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

module.exports = Url; 
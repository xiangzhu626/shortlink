const getDb = require('../config/database');

const User = {
    create: async (user) => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                [user.username, user.email, user.password, user.role || 'user'],
                function(err) {
                    if (err) {
                        console.error('创建用户失败:', err);
                        reject(err);
                    } else {
                        console.log('创建用户成功, ID:', this.lastID);
                        resolve(this.lastID);
                    }
                }
            );
        });
    },

    findByUsername: async (username) => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            console.log('正在查找用户:', username);
            db.get(
                `SELECT * FROM users WHERE username = ?`,
                [username],
                (err, row) => {
                    if (err) {
                        console.error('查找用户失败:', err);
                        reject(err);
                    } else {
                        console.log('查找用户结果:', row);
                        resolve(row);
                    }
                }
            );
        });
    },

    findAll: () => {
        return new Promise((resolve, reject) => {
            getDb().then((db) => {
                db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            getDb().then((db) => {
                db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        });
    },

    update: (id, data) => {
        const { email, role, status } = data;
        return new Promise((resolve, reject) => {
            getDb().then((db) => {
                db.run(
                    `UPDATE users SET 
                    email = COALESCE(?, email),
                    role = COALESCE(?, role),
                    status = COALESCE(?, status),
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?`,
                    [email, role, status, id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            getDb().then((db) => {
                db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    },

    updatePassword: (id, hashedPassword) => {
        return new Promise((resolve, reject) => {
            getDb().then((db) => {
                db.run(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        });
    },

    findByEmail: async (email) => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE email = ?`,
                [email],
                (err, row) => {
                    if (err) {
                        console.error('查找邮箱失败:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }
};

module.exports = User; 
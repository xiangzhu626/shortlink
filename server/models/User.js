const db = require('../config/database');

const User = {
    create: (user) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                [user.username, user.email, user.password, user.role || 'user'],
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

    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE username = ?`,
                [username],
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

    findAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    update: (id, data) => {
        const { email, role, status } = data;
        return new Promise((resolve, reject) => {
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
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    updatePassword: (id, hashedPassword) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
};

module.exports = User; 
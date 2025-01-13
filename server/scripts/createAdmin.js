const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    db.run(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@example.com', hashedPassword, 'admin'],
        (err) => {
            if (err) {
                console.error('创建管理员失败:', err);
            } else {
                console.log('管理员账号创建成功');
            }
            db.close();
        }
    );
}

createAdmin(); 
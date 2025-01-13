const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '未认证' });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: '权限不足' });
        }

        next();
    };
};

module.exports = checkRole; 
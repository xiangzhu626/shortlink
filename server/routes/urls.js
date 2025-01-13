const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const auth = require('../middleware/auth');

// 创建短链接
router.post('/', auth, urlController.create);

// 获取用户的短链接列表
router.get('/', auth, urlController.list);

// 重定向短链接
router.get('/:shortCode', urlController.redirect);

// 更新短链接
router.put('/:id', auth, urlController.update);

// 删除短链接
router.delete('/:id', auth, urlController.delete);

module.exports = router; 
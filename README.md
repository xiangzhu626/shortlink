# 短链接管理系统

一个现代化的短链接管理系统，使用 Node.js + Express + SQLite 构建。

## 功能特性

- 用户认证和授权
- 短链接生成和管理
- 访问统计
- 管理员后台
- RESTful API

## 技术栈

- Node.js
- Express
- SQLite3
- EJS 模板引擎
- Tailwind CSS
- JWT 认证

## 本地开发

1. 克隆项目
```bash
git clone [你的仓库地址]
cd short-url-system
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

4. 运行开发服务器
```bash
npm run dev
```

## 部署

1. 构建项目
```bash
npm run build
```

2. 启动服务
```bash
npm start
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT

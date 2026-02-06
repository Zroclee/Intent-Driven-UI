# Intent-Driven-UI

通用AI应用架构 - 意图驱动UI

这是一个Monorepo项目，使用pnpm进行管理，项目结构如下：

```
├── apps   // 应用
│   ├── web  // 前端应用
│   └── backend  // 后端应用
├── packages
│   ├── shared  // 公共UI组件库
├── docs  // 文档
├── configs  // 配置
├── .gitignore
├── package.json
└── README.md
```

项目架构：
apps/web - 基于Vite+Vue3+TypeScript的前端应用
apps/backend - 基于Node.js+TypeScript+Express的后端应用
packages/shared - 基于Vite+Vue3+TypeScript的公共UI组件库
docs - 基于VitePress的文档项目
configs - 配置文件

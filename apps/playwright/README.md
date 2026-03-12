# Playwright

## 项目初始化

1. 项目初始化

```zsh
pnpm install
```

2. 安装核心业务依赖

```zsh
pnpm add langchain @langchain/core @langchain/langgraph @langchain/openai playwright dotenv
```

3. 安装开发环境依赖 (TypeScript 相关)

```zsh
pnpm add -D typescript tsx @types/node @types/dotenv
```

4. 初始化 TypeScript 配置, 为了让 ts-node 和 LangChain 的 ESM 模块能够顺畅运行，我们需要生成并配置 tsconfig.json。

```zsh
npx tsc --init
```

5. 修改 tsconfig.json 关键配置：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

5. 在 package.json 中声明模块类型：

```json
{
  "name": "playwright-ai-assistant",
  "type": "module",
  ...
}
```

6. 初始化项目结构

```
playwright/
├── src/
│   ├── agent/            # LangGraph 状态机定义
│   │   └── graph.ts
│   ├── tools/            # Playwright 封装的原子工具
│   │   └── browser.ts
│   ├── types/            # 接口与状态定义
│   │   └── state.ts
│   └── index.ts          # 入口文件
├── .env                  # 环境变量（API Keys）
├── tsconfig.json
├── README.md
└── package.json
```

7. 环境变量配置

```
OPENAI_API_KEY=sk-xxxx...
# 如果使用其他模型或代理
# DEEPSEEK_API_KEY=xxxx
```

8. 在package.json中创建运行指令

```json
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "tsx src/index.ts"
  },
```

9. 配置打包工具

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
```

## 技术方向
为实现效果，我设计了两个技术方向
方向一：利用playwright封装原子化工具，大模型自行组合调用
方向二：大模型直接生成playwright代码，然后执行代码

## 工具构建 - Set-of-Mark (SoM)技术



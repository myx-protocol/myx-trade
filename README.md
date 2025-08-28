# MX Trade SDK

这是一个包含 SDK 和前端 playground 的 monorepo 项目。

## 项目结构

```
mx-trade-sdk/
├── packages/
│   ├── sdk/          # 交易 SDK 包
│   └── playground/   # 前端测试应用
├── pnpm-workspace.yaml
└── package.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 构建 SDK

```bash
pnpm build:sdk
```

### 启动前端 playground

```bash
pnpm dev:playground
```

### 构建前端

```bash
pnpm build:playground
```

## 开发

### 并行开发模式

```bash
pnpm dev
```

这将同时启动 SDK 的监听模式和前端的开发服务器。

### 清理构建文件

```bash
pnpm clean
```

## 包管理

- **SDK**: `@mx-trade/sdk` - 提供交易相关的功能
- **Playground**: `@mx-trade/playground` - 用于测试 SDK 的前端应用

## 技术栈

- **SDK**: TypeScript + tsup
- **Frontend**: React + Vite + TypeScript
- **Package Manager**: pnpm
- **Monorepo**: pnpm workspaces

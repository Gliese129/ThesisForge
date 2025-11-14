# ThesisForge

[English Version](README.md)

## 项目概述

ThesisForge 是一个由 AI 驱动的学术论文和文章生成平台，通过交互式的分步流程帮助用户创建结构化、高质量的学术内容。该应用程序利用 AI 技术协助大纲创建、内容生成和文章优化。

## 主要特性

- **交互式文章创建**：分步引导式的学术文章创建流程
  - 填写文章信息（标题、学科领域、目的、目标受众）
  - 定义文章结构，包含可自定义的章节
  - 使用 AI 辅助为每个章节生成内容
  - 审查和完善完整的文章

- **AI 驱动的内容生成**：利用 OpenAI 模型生成高质量的学术内容
- **灵活的结构**：创建包含多个章节和子章节的自定义文章大纲
- **实时预览**：实时审查和编辑生成的内容
- **Markdown 支持**：使用 Milkdown 编辑器进行富文本编辑
- **现代化界面**：基于 Vue 3 和 Vuetify 构建的清晰、响应式界面

## 技术栈

### 前端
- **框架**: Vue 3 with TypeScript
- **构建工具**: Vite
- **UI 库**: Vuetify 3
- **状态管理**: Vuex
- **路由**: Vue Router
- **编辑器**: Milkdown（Markdown 编辑器）
- **样式**: Tailwind CSS, SASS

### 后端
- **框架**: Sanic（Python 异步 Web 框架）
- **AI 集成**: OpenAI API
- **数据验证**: Pydantic

## 项目结构

```
ThesisForge/
├── front/                 # 前端 Vue 应用
│   ├── src/
│   │   ├── pages/        # 应用页面
│   │   │   └── create-article/  # 文章创建工作流
│   │   ├── components/   # 可复用的 Vue 组件
│   │   ├── store/        # Vuex 状态管理模块
│   │   ├── api/          # API 客户端
│   │   └── router.ts     # Vue Router 配置
│   ├── package.json
│   └── vite.config.ts
├── back/                  # 后端 Python 应用
│   ├── handler/          # API 路由处理器
│   │   └── aritcle/     # 文章相关的端点
│   ├── model/            # 数据模型
│   ├── utils/            # 工具函数
│   └── app.py            # 主应用入口
└── README.md
```

## 快速开始

### 环境要求

- Node.js（v16 或更高版本）
- Python 3.8+
- Yarn 或 npm
- OpenAI API 密钥

### 前端设置

1. 进入前端目录：
```bash
cd front
```

2. 安装依赖：
```bash
yarn install
# 或
npm install
```

3. 启动开发服务器：
```bash
yarn dev
# 或
npm run dev
```

4. 构建生产版本：
```bash
yarn build
# 或
npm run build
```

### 后端设置

1. 进入后端目录：
```bash
cd back
```

2. 安装 Python 依赖：
```bash
pip install sanic pydantic openai
```

3. 配置您的 OpenAI API 密钥（设置为环境变量或在配置文件中）

4. 启动后端服务器：
```bash
python app.py
```

后端服务器将在 `http://localhost:8080` 上启动

## 使用方法

1. **访问应用**：打开浏览器并导航到前端开发服务器（通常是 `http://localhost:5173`）

2. **创建新文章**：
   - **步骤 1 - 填写信息**：输入文章详情，包括标题、学科领域、目的、目标受众和语言
   - **步骤 2 - 定义结构**：创建包含章节和子章节的文章大纲
   - **步骤 3 - 完成内容**：使用 AI 辅助为每个章节生成内容
   - **步骤 4 - 审查文章**：审查并最终确定完整的文章

3. **生成内容**：使用 AI 驱动的内容生成功能，根据您的大纲和要求创建高质量的学术文本

## API 端点

### 文章管理

- `POST /article/generate-content/get-prompt` - 获取内容生成的 AI 提示词
- `POST /article/generate-content/manual` - 解析手动提供的内容
- `POST /article/generate-content` - 使用 AI 生成内容
- 其他用于大纲和结构管理的端点

## 开发指南

### 前端开发

前端使用 Vue 3 Composition API 和 TypeScript。主要特点：

- 热模块替换（HMR）以获得即时反馈
- TypeScript 提供类型安全
- Vuetify 组件确保 UI 一致性
- Milkdown 提供丰富的 Markdown 编辑功能

### 后端开发

后端使用 Sanic 构建，这是一个异步 Python Web 框架：

- RESTful API 设计
- 异步请求处理以提高性能
- Pydantic 模型进行数据验证
- OpenAI 集成提供 AI 功能

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目在仓库所有者指定的条款下可供使用。

## 支持

如有问题、疑问或想要贡献，请在 GitHub 仓库上提交 issue。

# GUXY - 游戏交互设计AI工作流平台

<p align="center">
  <img src="https://img.shields.io/badge/version-v1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/platform-web-blue" alt="Platform">
</p>

GUXY是一个AI驱动的游戏交互设计工作流平台，从策划案分析到高保真UI生成，提供一站式解决方案。

## 🚀 快速开始

### 在线访问（推荐）
部署到 GitHub Pages 后，用户可以通过以下链接访问：
- 访问地址: `https://<你的用户名>.github.io/<仓库名>/`

### 本地启动
#### Windows用户
1. 双击运行 `启动GUXY.bat`
2. 选择启动方式（Python/Node.js/直接打开）
3. 在浏览器访问提示的地址

#### 使用Python
```bash
cd GUXY
python -m http.server 8000
```
然后在浏览器访问: http://localhost:8000

#### 使用Node.js
```bash
cd GUXY
npx http-server -p 8000 --cors
```
然后在浏览器访问: http://localhost:8000

#### 直接打开
直接在浏览器中打开 `GUXY/online/index.html` 文件

⚠️ 注意：直接打开HTML文件可能导致某些功能受限，建议使用本地服务器

## 📋 功能特性
### 7步工作流程
1. **AI分析策划案** - 使用AI分析策划案，提取交互逻辑和功能需求
2. **生成卡片交互架构** - 自动生成卡片和集合架构
3. **手动调整卡片架构** - 在画布上调整节点和连线
4. **导出AI可读架构** - 导出JSON格式的架构文件
5. **生成开发规划** - 生成详细的开发任务计划
6. **开发与自检** - 执行开发并进行UX自检
7. **生成高保真UI** - 使用AI生成高保真UI设计稿

### 技术特性
- 纯前端静态应用，无需后端服务器
- 基于Canvas API的交互式画布
- IndexedDB本地存储项目数据
- AI集成支持多种模型（智谱GLM-4、OpenAI GPT等）
- 响应式设计，支持多种屏幕尺寸

## 🔧 API配置
首次使用时，需要配置AI API密钥：
1. 点击界面右上角的"API配置"按钮
2. 输入您的API密钥和Base URL
3. 选择使用的模型
4. 点击确认保存

支持的服务：
- 智谱GLM-4（默认）: https://open.bigmodel.cn/api/paas/v4
- OpenAI GPT: https://api.openai.com/v1
- 其他兼容OpenAI API的服务

## 📁 目录结构
```
GUXY/
├── online/                # 在线应用
│   ├── index.html        # 主HTML
│   └── index.js           # 应用入口
├── modules/               # 模块化代码
│   ├── core/             # 核心模块
│   ├── canvas/           # 画布模块
│   ├── nodes/            # 节点组件
│   ├── interaction/      # 交互模块
│   ├── guxy/             # GUXY特定功能
│   └── ui/               # UI组件
├── styles/                # CSS样式
├── skills/                # Cursor AI技能
├── .cursor/skills/        # 项目级技能
├── docs/                  # 文档
├── templates/             # 模板文件
├── config/                # 配置文件
├── logs/                  # 日志
└── resources/             # 资源文件
```

## 📖 技术栈
- **前端**: 原生JavaScript + Canvas API
- **存储**: IndexedDB + LocalStorage
- **样式**: CSS3 + CSS变量
- **AI集成**: OpenAI API兼容接口
- **UI生成**: 支持多种图像生成API

## 🚀 部署到 GitHub Pages
### 步骤1: 创建GitHub仓库
1. 登录 GitHub，创建一个新仓库（如 `guxy-platform`）
2. 选择公开或私有仓库

### 步骤2: 推送代码
```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "准备部署到GitHub Pages"

# 添加远程仓库
git remote add origin https://github.com/<你的用户名>/<仓库名>.git

# 推送到GitHub
git push -u origin main
```

### 步骤3: 启用GitHub Pages
1. 进入仓库的 Settings > Pages
2. 在 "Source" 部分选择:
   - Branch: main（或master）
   - Folder: /GUXY
3. 点击 Save

### 步骤4: 访问应用
等待几分钟后，您的应用将在以下地址可用：
```
https://<你的用户名>.github.io/<仓库名>/
```

## 📝 注意事项
- **API密钥安全**: API密钥存储在用户浏览器的localStorage中，不会上传到服务器
- **CORS限制**: 部分功能可能需要后端代理来绕过CORS限制
- **浏览器兼容性**: 推荐使用现代浏览器（Chrome、Firefox、Edge）

## 📜 版本历史
### v1.0.0 (2026-02-05)
- 初始版本发布
- 7步工作流程实现
- 可视化画布功能
- AI集成完成
- UI生成功能完成
- 启动器工具完成

## 📜 许可证
MIT License

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

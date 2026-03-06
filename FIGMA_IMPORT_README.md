# 将架构 JSON 导入 Figma 的两种方式

## 方式一：使用转换脚本 + Figma 插件（推荐）

### 1. 转换脚本生成 Figma JSON
在项目目录运行：
```bash
node convert-architecture-to-figma.js "你的架构文件路径.json" "输出路径.json"
```
例如：
```bash
node convert-architecture-to-figma.js "d:\Administrator\Downloads\2026-02-10_10-58-42_architecture.json" "architecture-figma.json"
```

### 2. 导入到 Figma
- 安装 Figma 社区插件 **"JSON to Figma Import"**  
  https://www.figma.com/community/plugin/1396123287818850149
- 在 Figma 中运行该插件
- 选择生成的 `architecture-figma.json` 文件导入

---

## 方式二：使用自定义 Figma 插件（最可靠）

### 1. 安装插件
1. 打开 Figma → 菜单 **资源** → **插件** → **开发** → **导入插件**
2. 选择 `figma-import-plugin` 文件夹（包含 manifest.json 的目录）
3. 插件安装后会显示为「导入游戏架构」

### 2. 使用插件
1. 在 Figma 中创建或打开一个设计文件
2. 菜单 **资源** → **插件** → **开发** → **导入游戏架构**
3. 将你的 `architecture.json` 文件内容**完整复制**粘贴到输入框
4. 点击「生成 Figma 界面」

插件会在当前页面生成可编辑的界面框架，包括：
- 系统标题和描述
- 每个界面卡片（标题、等级、描述）
- 自动布局，支持后续编辑

---

## 已生成的文件

针对 `2026-02-10_10-58-42_architecture.json` 已生成：
- **d:\Administrator\Downloads\architecture-figma.json** - Figma REST API 格式，可供 JSON to Figma Import 等插件使用

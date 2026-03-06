# GUXY 项目结构说明

> 本文档说明GUXY AI工作流平台的文件组织逻辑、命名规范和版本控制策略。

---

## 目录结构概览

```
GUXY/
├── skills/                          # Skill文件目录
│   ├── 01-ai-analysis/            # 流程①：AI分析方法
│   ├── 02-architecture-gen/        # 流程②：生成卡片交互架构
│   ├── 05-interaction-spec/        # 流程⑤：交互规范
│   └── 06-self-check/              # 流程⑥：体验流程AI自检
├── docs/                           # 文档目录
│   ├── 01-interactive-logic-records.md    # 流程①：交互逻辑记录
│   ├── 04-game-bundle-changelog.md         # 流程④：游戏包体更新日志
│   ├── workflow-guide.md                    # 平台工作流程指南
│   └── project-structure.md                # 本文档：项目结构说明
├── resources/                      # 资源目录
│   ├── ui-resources/              # UI资源
│   │   ├── assets/
│   │   │   ├── images/          # 图片资源
│   │   │   ├── icons/           # 图标资源
│   │   │   └── fonts/           # 字体资源
│   │   ├── styles/
│   │   │   ├── components/       # 组件样式
│   │   │   └── themes/          # 主题样式
│   │   └── mockups/
│   │       ├── low-fi/          # 低保真原型
│   │       └── high-fi/         # 高保真设计
│   └── reference-resources/       # 参考资源
│       ├── references/          # 设计参考图
│       ├── competitive/          # 竞品分析
│       └── patterns/           # 交互模式库
├── logs/                          # 日志目录
│   └── ux-self-check-[feature]-[date].md  # UX自检报告
├── templates/                     # 模板目录
│   ├── architecture-template.json  # 架构JSON模板
│   └── interaction-spec-template.md # 交互规范模板
├── config/                        # 配置目录
│   └── platform-config.json       # 平台配置文件
├── tools/                         # 工具脚本目录
│   └── [自定义工具]
├── .cursor/                       # Cursor项目配置
│   └── skills/                    # 项目级skill文件
│       ├── 01-ai-analysis/
│       ├── 02-architecture-gen/
│       ├── 05-interaction-spec/
│       └── 06-self-check/
└── README.md                      # 平台主说明文档
```

---

## 目录详细说明

### skills/

**目的**: 存储所有Cursor AI技能文件

**结构**:
- 每个技能一个独立文件夹
- 文件夹命名格式：`[序号]-[kebab-case-name]`
- 每个文件夹包含`SKILL.md`主文件

**命名规则**:
- 序号：对应工作流程的步骤编号（01, 02, 05, 06）
- 名称：小写字母，使用连字符分隔

**使用方式**:
- 项目级技能：存储在`.cursor/skills/`
- 自动链接：启动时从`skills/`复制或链接到`.cursor/skills/`

**示例**:
```
skills/
├── 01-ai-analysis/
│   └── SKILL.md
├── 02-architecture-gen/
│   └── SKILL.md
```

---

### docs/

**目的**: 存储平台的所有文档

**结构**:
- `[序号]-[文档名称].md`
- 序号对应工作流程步骤

**文件说明**:
- `01-interactive-logic-records.md`: 流程①的交互逻辑记录模板
- `04-game-bundle-changelog.md`: 流程④的游戏包体更新日志模板
- `workflow-guide.md`: 完整的工作流程指南
- `project-structure.md`: 本文档，项目结构说明

**命名规则**:
- 文档序号：对应工作流程步骤
- 名称：小写字母，连字符分隔
- 扩展名：`.md`

---

### resources/

#### ui-resources/

**目的**: 存储UI相关的所有资源

**assets/images/
- 存储所有图片资源
- 命名：`[界面名]_[元素名]_[状态].png`
- 示例：`mainmenu_bg_default.png`, `inventory_item_selected.png`

**assets/icons/
- 存储图标资源
- 命名：`icon_[功能].svg`或`icon_[功能].png`
- 建议使用SVG格式以支持缩放

**assets/fonts/
- 存储字体文件
- 命名：`[字体名]-[字重].[woff2/woff/ttf]`
- 示例：`Roboto-Regular.woff2`, `NotoSansSC-Bold.woff2`

**styles/components/
- 存储UI组件样式
- 命名：`[组件名].css`
- 示例：`button.css`, `modal.css`

**styles/themes/
- 存储主题样式
- 命名：`[主题名]-[色板].css`
- 示例：`dark-theme-purple.css`, `light-theme-blue.css`

**mockups/low-fi/
- 存储低保真原型
- 命名：`[界面名]-[版本].png`或`.sketch`
- 示例：`inventory-v1.png`, `character-v2.sketch`

**mockups/high-fi/
- 存储高保真设计
- 命名：`[界面名]_[状态]-[版本].[png/psd/figma]`
- 示例：`inventory_default-v1.png`, `character_loading-v2.fig`

#### reference-resources/

**目的**: 存储设计和交互参考资源

**references/**
- 存储设计参考图
- 命名：`[类型]_[描述].[扩展名]`
- 示例：`mobile_navigation_pattern.png`, `game_ui_style.jpg`

**competitive/**
- 存储竞品分析资料
- 命名：`[游戏名]_[界面]_analysis.[扩展名]`
- 示例：`gameA_inventory_analysis.pdf`

**patterns/**
- 存储交互模式库
- 命名：`[模式名]_pattern.[扩展名]`
- 示例：`pull_to_refresh_pattern.md`, `swipe_gesture_pattern.png`

---

### logs/

**目的**: 存储平台运行和自检日志

**命名规则**:
- UX自检报告：`ux-self-check-[feature-name]-[YYYY-MM-DD].md`
- 平台日志：`platform-[type]-[YYYY-MM-DD].log`

**示例**:
```
logs/
├── ux-self-check-inventory-2026-02-05.md
├── ux-self-check-combat-2026-02-06.md
└── platform-error-2026-02-05.log
```

**保留策略**:
- UX自检报告：永久保留
- 平台日志：保留30天
- 大日志文件（>10MB）：压缩存档

---

### templates/

**目的**: 存储各种模板文件

**architecture-template.json**
- PiaJi架构JSON模板
- 包含collections、cards、links的标准结构
- 作为架构生成的基础

**interaction-spec-template.md**
- 交互规范模板
- 包含通用规范和标准
- 作为编写具体规范的参考

---

### config/

**platform-config.json**
平台配置文件，包含：

```json
{
  "version": "1.0.0",
  "platform": {
    "name": "GUXY",
    "description": "游戏交互设计AI工作流平台"
  },
  "ai": {
    "model": "glm-4-flash",
    "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
    "maxTokens": 4096
  },
  "paths": {
    "skills": "skills/",
    "docs": "docs/",
    "resources": "resources/",
    "templates": "templates/"
  },
  "workflow": {
    "checkThreshold": 80,
    "autoLayout": true
  }
}
```

---

### tools/

**目的**: 存放自定义工具脚本

**支持的语言**:
- Python (`.py`)
- JavaScript/Node.js (`.js`)
- Bash/Shell (`.sh`)
- PowerShell (`.ps1`)

**命名规则**:
- 功能名 + 工具类型 + 扩展名
- 示例：`export-architecture-tool.py`, `validate-format.js`

**用途**:
- 自动化重复性任务
- 批量处理资源
- 验证文件格式
- 生成报告

---

### .cursor/

**目的**: Cursor IDE的项目配置

**skills/**
- 项目级技能文件
- 从`skills/`目录复制或链接
- 确保AI可以访问平台技能

**其他配置文件**:
- `.cursorrules`: AI行为规则（可选）
- `.cursorignore`: 忽略文件（可选）

---

## 文件命名规范

### 通用规则

1. **使用英文命名**
   - 文件夹和文件名使用英文
   - 避免中文字符
   - 使用有意义的名称

2. **分隔符**
   - 文件夹：使用连字符 `-` 或下划线 `_`
   - 文件名：使用连字符 `-`
   - 类名：使用驼峰命名 `PascalCase`
   - 变量名：使用驼峰命名 `camelCase`

3. **大小写**
   - 文件夹：小写或大驼峰
   - 文件名：小写
   - 扩展名：小写

### 特定类型命名

**Skill文件**:
- 格式：`[序号]-[kebab-case-name]/SKILL.md`
- 示例：`01-ai-analysis/SKILL.md`

**文档文件**:
- 格式：`[序号]-[kebab-case-name].md`
- 示例：`01-interactive-logic-records.md`

**图片资源**:
- 格式：`[界面名]_[元素名]_[状态].[扩展名]`
- 示例：`mainmenu_button_pressed.png`

**架构文件**:
- 格式：`architecture-[feature-name]-[version].json`
- 示例：`architecture-inventory-v1.0.json`

**日志文件**:
- 格式：`[类型]-[描述]-[YYYY-MM-DD].[扩展名]`
- 示例：`ux-self-check-combat-2026-02-05.md`

---

## 版本控制策略

### 版本库结构（SVN）

```
GUXY/
├── skills/
├── docs/
├── resources/
│   ├── .gitkeep
│   └── ...
├── logs/
│   └── ...
├── templates/
├── config/
├── tools/
├── .cursor/
└── README.md
```

### 忽略规则（svn:ignore 或本地忽略）

日志、临时文件、依赖目录等建议加入忽略，不纳入版本库。保留 `logs/.gitkeep` 等占位文件。

### 分支策略（SVN 目录）

**主分支**:
- `main`: 稳定版本
- `develop`: 开发版本

**功能分支**:
- 命名：`feature/[功能名称]`
- 示例：`feature/add-new-skill`, `feature/improve-workflow`

**修复分支**:
- 命名：`fix/[问题描述]`
- 示例：`fix/bug-in-architecture-gen`

**文档分支**:
- 命名：`docs/[文档更新]`
- 示例：`docs/update-workflow-guide`

### 提交信息规范

**格式**:
```
[类型] ([范围]): 简短描述

详细描述（可选）

关联问题（可选）
```

**类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**:
```
feat(skills): add self-check validation skill

Implement UX self-check skill to validate new features
against interaction specifications.

Closes #123
```

### 标签规范

**版本标签**:
- 格式：`v[主版本].[次版本].[修订版]`
- 示例：`v1.0.0`, `v1.1.5`

**里程碑标签**:
- 格式：`[类型]-[描述]`
- 示例：`release-v1.0`, `milestone-alpha`

---

## 文件权限和安全

### 敏感信息

**不提交的内容**:
- API密钥
- 个人配置
- 临时密钥
- 真实用户数据

**环境变量**:
- 使用`.env`文件
- 加入版本库忽略列表
- 提供`.env.example`模板

### 访问控制

**公开文件**:
- 所有skill文件
- 文档和模板
- 非敏感的配置

**私有文件**:
- 个人日志
- 测试数据
- 临时资源

---

## 维护指南

### 定期维护任务

**每周**:
- 检查日志文件大小
- 清理临时文件
- 更新文档中的过时内容

**每月**:
- 压缩归档旧日志
- 审查和更新规范
- 清理未使用的资源

**每季度**:
- 审查整个项目结构
- 优化文件组织
- 更新依赖和工具

### 质量检查

**定期检查**:
- [ ] 所有文件命名符合规范
- [ ] 文档内容准确完整
- [ ] 无冗余或过时文件
- [ ] 提交历史清晰
- [ ] 所有必要的文件已提交

**自动化检查**:
- 使用脚本验证文件命名
- 检查文档链接有效性
- 验证JSON格式正确性

---

## 扩展指南

### 添加新Skill

1. 在`skills/`创建新文件夹
2. 创建`SKILL.md`文件
3. 编写skill内容
4. 在`.cursor/skills/`中创建链接或复制
5. 更新`README.md`

### 添加新文档

1. 在`docs/`创建新文档
2. 遵循命名规范
3. 更新相关文档的交叉引用
4. 在`README.md`中添加链接

### 添加新工具

1. 在`tools/`创建脚本文件
2. 添加执行权限（如需要）
3. 编写使用说明
4. 添加到工作流程文档（如适用）

---

## 相关资源

- **平台主文档**: `../README.md`
- **工作流程指南**: `workflow-guide.md`
- **交互规范**: `../skills/05-interaction-spec/SKILL.md`

---

**版本**: v1.0
**更新日期**: 2026-02-05
**维护者**: GUXY团队

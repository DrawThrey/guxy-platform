# UI Resources

> 本目录存储所有UI相关的资源文件，包括图片、图标、字体、样式和原型。

---

## 目录结构

```
ui-resources/
├── assets/
│   ├── images/          # 图片资源
│   ├── icons/           # 图标资源
│   └── fonts/           # 字体资源
├── styles/
│   ├── components/       # 组件样式
│   └── themes/          # 主题样式
└── mockups/
    ├── low-fi/          # 低保真原型
    └── high-fi/         # 高保真设计
```

---

## assets/images/

### 用途
存储所有界面相关的图片资源。

### 命名规范
```
[界面名]_[元素名]_[状态].[扩展名]
```

**示例**:
- `mainmenu_bg_default.png`
- `inventory_item_selected.png`
- `character_avatar_loading.png`

### 分类

**背景图片**:
- `*_bg_*.png` / `*_bg_*.jpg`
- 用途：界面背景、卡片背景
- 格式：PNG（透明）/JPG（不透明）

**界面元素**:
- `*_button_*.png`
- `*_icon_*.png`
- `*_panel_*.png`
- 用途：界面中的视觉元素
- 格式：PNG（推荐，支持透明）

**角色和道具**:
- `*_avatar_*.png`
- `*_item_*.png`
- `*_weapon_*.png`
- 用途：游戏中的角色、道具、武器等
- 格式：PNG（推荐）

### 尺寸规范
- 图标：最小 32x32，推荐 64x64
- 按钮：最小 44x44（移动端），32x32（PC端）
- 背景：匹配目标设备分辨率
- 一般元素：根据实际需求

### 状态标识
- `default`: 默认状态
- `hover`: 悬停状态
- `pressed`: 按下状态
- `disabled`: 禁用状态
- `selected`: 选中状态
- `loading`: 加载状态
- `error`: 错误状态
- `success`: 成功状态

---

## assets/icons/

### 用途
存储所有图标资源。

### 命名规范
```
icon_[功能/用途].[扩展名]
```

**示例**:
- `icon_home.svg`
- `icon_settings.png`
- `icon_add.svg`

### 格式优先级
1. **SVG**（优先推荐）
   - 优点：可缩放、文件小、支持动画
   - 用途：所有可矢量化的图标

2. **PNG**
   - 优点：兼容性好、支持透明
   - 用途：复杂渐变、特殊效果的图标

### 图标分类

**导航图标**:
- `icon_home.*` - 主页
- `icon_back.*` - 返回
- `icon_menu.*` - 菜单

**操作图标**:
- `icon_add.*` - 添加
- `icon_edit.*` - 编辑
- `icon_delete.*` - 删除
- `icon_save.*` - 保存

**状态图标**:
- `icon_success.*` - 成功
- `icon_error.*` - 错误
- `icon_warning.*` - 警告
- `icon_info.*` - 信息

**功能图标**:
- `icon_inventory.*` - 背包
- `icon_character.*` - 角色
- `icon_skill.*` - 技能
- `icon_quest.*` - 任务

### SVG规范
- 使用`viewBox`确保可缩放
- 避免硬编码宽高
- 使用`currentColor`支持颜色变化
- 优化代码，删除不必要的节点和属性

---

## assets/fonts/

### 用途
存储所有字体文件。

### 命名规范
```
[字体名]-[字重]-[样式].[woff2/woff/ttf/otf]
```

**示例**:
- `Roboto-Regular.woff2`
- `NotoSansSC-Bold.woff2`
- `OpenSans-MediumItalic.woff2`

### 字重标识
- `Thin` - 100
- `ExtraLight` - 200
- `Light` - 300
- `Regular` - 400
- `Medium` - 500
- `SemiBold` - 600
- `Bold` - 700
- `ExtraBold` - 800
- `Black` - 900

### 格式优先级
1. **WOFF2**（推荐）
   - 最小文件大小
   - 现代浏览器支持

2. **WOFF**
   - 良好的兼容性
   - 适中文件大小

3. **TTF/OTF**
   - 最大兼容性
   - 较大文件大小

### 字体文件清单

#### 中文字体
- `NotoSansSC-Regular.woff2` - 思源黑体 Regular
- `NotoSansSC-Bold.woff2` - 思源黑体 Bold

#### 英文字体
- `Roboto-Regular.woff2` - Roboto Regular
- `Roboto-Medium.woff2` - Roboto Medium
- `Roboto-Bold.woff2` - Roboto Bold

#### 图标字体
- `FontAwesome-Regular.woff2` - FontAwesome
- `MaterialIcons-Regular.woff2` - Material Icons

---

## styles/components/

### 用途
存储UI组件的样式定义。

### 命名规范
```
[组件名].css / [组件名].scss
```

**示例**:
- `button.css`
- `modal.css`
- `card.css`
- `navigation.css`

### 组件清单

#### 基础组件
- `button.css` - 按钮样式
- `input.css` - 输入框样式
- `icon.css` - 图标样式
- `text.css` - 文本样式

#### 布局组件
- `container.css` - 容器
- `flex.css` - Flex布局
- `grid.css` - Grid布局
- `spacing.css` - 间距

#### 功能组件
- `modal.css` - 模态框
- `dropdown.css` - 下拉菜单
- `tooltip.css` - 工具提示
- `notification.css` - 通知

### 样式规范

**BEM命名**:
```css
.block { }
.block__element { }
.block--modifier { }
```

**示例**:
```css
.button { }
.button__icon { }
.button--primary { }
.button--disabled { }
```

---

## styles/themes/

### 用途
存储主题样式定义。

### 命名规范
```
[主题名]-[色板/风格].css / [主题名]-[色板/风格].scss
```

**示例**:
- `dark-purple.css` - 深色紫色主题
- `light-blue.css` - 浅色蓝色主题
- `color-gold.css` - 金色色板

### 主题清单

#### 深色主题
- `theme-dark-purple.css` - 深色紫色（默认）

#### 浅色主题
- `theme-light-blue.css` - 浅色蓝色
- `theme-light-green.css` - 浅色绿色

#### 特殊主题
- `theme-high-contrast.css` - 高对比度
- `theme-colorblind.css` - 色盲模式

### 主题结构

```css
:root {
  /* 主色调 */
  --color-primary: #8b5cf6;
  --color-primary-hover: #7c3aed;
  --color-primary-disabled: #a78bfa;

  /* 辅助色 */
  --color-secondary: #ec4899;
  --color-accent: #f59e0b;

  /* 中性色 */
  --color-text-primary: #ffffff;
  --color-text-secondary: #e5e7eb;
  --color-background: #0d0a12;
  --color-surface: #1a1625;

  /* 状态色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2);

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 动画 */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --easing-ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## mockups/low-fi/

### 用途
存储低保真原型，用于快速验证交互流程。

### 命名规范
```
[界面名]-[版本].[扩展名]
```

**示例**:
- `inventory-v1.png`
- `character-v2.png`
- `main-menu-wireframe.fig`

### 文件格式
- **PNG** - 快速导出，便于分享
- **SKETCH** - 可编辑原型，支持组件
- **FIGMA** - 可编辑原型，支持协作
- **XD** - Adobe XD设计文件

### 用途
- 快速验证交互流程
- 内部评审和讨论
- 开发参考
- 用户测试

### 内容要求
- 明确的界面层级
- 关键交互路径
- 信息架构
- 功能布局

---

## mockups/high-fi/

### 用途
存储高保真设计，用于最终实现和交付。

### 命名规范
```
[界面名]_[状态]-[版本].[扩展名]
```

**示例**:
- `inventory_default-v1.png`
- `character_selected-v2.fig`
- `main-menu_pressed-v3.psd`

### 文件格式
- **PNG** - 最终交付，支持透明
- **JPG** - 最终交付，高质量
- **PSD** - Adobe Photoshop源文件
- **FIGMA** - 可编辑设计，支持协作
- **SVG** - 矢量图形，可缩放

### 分辨率要求

**移动端**:
- 标准: 750x1334 (iPhone 8)
- 高分: 1242x2208 (iPhone X)

**PC端**:
- 标准: 1920x1080 (1080p)
- 高分: 2560x1440 (2K)
- 超清: 3840x2160 (4K)

### 状态清单
每个界面应包含以下状态：
- `default` - 默认状态
- `hover` - 悬停状态
- `pressed` - 按下状态
- `disabled` - 禁用状态
- `loading` - 加载状态
- `empty` - 空状态
- `error` - 错误状态

### 交付要求
- 包含所有必要状态
- 背景透明度规范
- 文件优化（合理压缩）
- 命名清晰规范
- 版本管理

---

## 资源管理

### 版本控制

**版本跟踪**:
- 所有源文件提交到版本库（SVN）
- 压缩文件使用 LFS 或单独策略（可选）
- 临时文件加入忽略列表

**文件大小**:
- 单个图片文件 < 2MB
- 大文件考虑分片或压缩
- 使用WebP格式优化大小

### 优化策略

**图片优化**:
- 使用PNG压缩工具
- 使用WebP格式（如支持）
- 按需加载
- 懒加载非首屏图片

**字体优化**:
- 使用WOFF2格式
- 子集化（只包含需要的字符）
- 使用系统字体作为后备

**代码优化**:
- 压缩CSS文件
- 移除未使用的样式
- 使用CSS变量

---

## 资源索引

创建`index.md`文件，列出所有资源：

```markdown
# UI Resources Index

## Images
- mainmenu_bg_default.png
- inventory_item_selected.png

## Icons
- icon_home.svg
- icon_settings.svg

## Fonts
- Roboto-Regular.woff2
- NotoSansSC-Bold.woff2

## Styles
- button.css
- modal.css

## Mockups
### Low-Fi
- inventory-v1.png

### High-Fi
- inventory_default-v1.png
```

---

## 联系方式

如有资源相关问题，请联系设计团队：
- 设计负责人: [姓名]
- 邮箱: [邮箱]
- 协作平台: [Figma/Sketch/其他]

---

**版本**: v1.0
**更新日期**: 2026-02-05

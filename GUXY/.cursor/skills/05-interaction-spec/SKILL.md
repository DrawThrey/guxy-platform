---
name: interaction-specification
description: Define and enforce interaction specification standards for game interfaces. Check consistency, interface hierarchy, animation feedback, and accessibility requirements. Use when defining interaction standards, reviewing interface designs, or when user mentions interaction specifications.
---

# Interaction Specification Standards

## Purpose

Define and enforce consistent interaction standards across all game interfaces and features.

## Scope

Apply these standards when:
- Designing new interface interactions
- Reviewing existing interface implementations
- Creating interaction patterns for reuse
- Ensuring feature consistency

## Core Principles

### 1. Consistency

- **Visual consistency**: Same actions use same icons, colors, and feedback
- **Behavioral consistency**: Same controls behave identically across screens
- **Terminology consistency**: Use consistent language for UI elements

### 2. Interface Hierarchy

**Level 1 (Primary Screens)**
- Main entry points from game
- Accessible from global navigation
- High-level feature access
- Examples: Main menu, Inventory, Character screen

**Level 2 (Secondary Screens)**
- Accessed from level 1 screens
- Detail views of specific features
- Medium-level information density
- Examples: Item details, Skill tree, Quest list

**Level 3 (Tertiary Screens)**
- Accessed from level 2 screens
- Granular information or actions
- Low-level controls
- Examples: Equipment slot options, Skill upgrade dialog

### 3. Feedback Standards

**Visual Feedback**
- **Immediate feedback**: < 100ms response time for taps/clicks
- **Action feedback**: Clear visual indication of action (highlight, scale, color change)
- **State feedback**: Show current state clearly (selected, disabled, loading)
- **Progress feedback**: Progress bars for long operations

**Animation Feedback**
- **Micro-interactions**: Subtle animations on button press, hover
- **Transitions**: Smooth fades, slides between screens (200-400ms)
- **Loading states**: Animated indicators for network operations
- **Success/failure**: Distinct animations for positive/negative outcomes

**Audio Feedback**
- **Button sounds**: Short, pleasant click sounds
- **Action sounds**: Context-appropriate sounds for major actions
- **Alert sounds**: Distinct sounds for notifications, errors
- **Volume balance**: All audio at consistent perceived volume levels

### 4. Interaction Patterns

**Navigation**
- Clear back navigation on non-root screens
- Breadcrumbs for deep hierarchies (3+ levels)
- Tab navigation for switching views within same level
- Gesture support for common actions (swipe back)

**Input**
- Touch targets: Minimum 44x44 pixels
- Click targets: Minimum 24x24 pixels with spacing
- Drag gestures: Visual feedback showing draggable state
- Long-press: Visual timer or vibration feedback

**Confirmation**
- Destructive actions require confirmation
- Undo option for non-destructive actions
- Clear consequences displayed before confirmation
- No double-confirmations (one is sufficient)

**Error Handling**
- Clear error messages explaining what went wrong
- Suggested actions to resolve error
- Retry mechanism where applicable
- Graceful degradation for offline scenarios

### 5. Information Display

**Hierarchy**
- Primary information: Largest, most prominent
- Secondary information: Medium size, less emphasis
- Tertiary information: Smallest, subtle
- Group related information visually

**Clarity**
- Use plain language, avoid jargon
- Provide contextual help when complexity increases
- Use tooltips for hoverable elements
- Show units and scales for numerical data

**Density**
- Level 1: Low density, emphasis on discovery
- Level 2: Medium density, balanced information
- Level 3: High density, information-rich

### 6. Accessibility Standards

**Visual Accessibility**
- Color contrast ratio: Minimum 4.5:1 for text
- Text scaling: Support 125%, 150%, 200% sizes
- Color blindness: Don't rely on color alone for meaning
- Animation: Provide option to reduce/disable motion

**Motor Accessibility**
- Keyboard navigation: All interactive elements reachable via keyboard
- Large touch targets: Minimum size requirements
- Gesture alternatives: Button alternatives for gestures
- Timing: No strict time limits for user actions

**Cognitive Accessibility**
- Error prevention: Clear input validation
- Consistent layout: Predictable element placement
- Focus indicators: Clear visual indication of focus
- Help text: Contextual assistance available

## Visual Style Guidelines (720×1600 MMOARPG)

> 本节用于规定竖版 720×1600 mmorpg 游戏在视觉上的统一风格。默认整体美术方向为「二次元动漫渲染 + 暖金史诗感」。

### 1. Color System

- **Primary Colors（主色）**
  - 主金色：`#FFD84A`，用于关键操作按钮、核心高亮、重要数值与稀有奖励。
  - 深金色：`#E0B132`，用于主按钮按下态、描边、重要分隔线。
  - 规则：同一屏幕内主金色高亮区域不超过 2 处（例如：主 CTA 按钮 + 1 个关键数值），避免视觉疲劳。

- **Secondary Colors（辅色）**
  - 深蓝：`#131A2B`，大面积背景、主面板底色。
  - 深紫：`#232743`，PVE / PVP 标签、次按钮背景、次级高亮。
  - 规则：辅色承担层级与区域划分，不抢主色注意力。

- **Neutral Colors（中性色）**
  - 主要文字：`#F5F5F7`
  - 次要文字：`#C2C5CD`
  - 弱提示文字：`#8B8F99`
  - 分割线：`#2E3340`
  - 面板描边：`#3C4152`
  - HUD / 面板背景：使用 `rgba(10–16, 10–16, 20–30, 0.65–0.9)` 范围内的深色半透明。

- **Semantic Colors（语义色）**
  - 成功：`#44D17A`（成功提示、强化成功、通过校验等）
  - 警告：`#FFC857`（次数不足、即将过期、容量临界）
  - 危险：`#FF4B4B`（删除、解散、失败）
  - 冷却 / 不可用：`#6C6F7A` + 不透明度 40–60%

- **Rarity Colors（品质色）**
  - 普通：`#B0B0B0`
  - 精良：`#4AE0A2`
  - 稀有：`#3BA4FF`
  - 史诗：`#C158FF`
  - 传说：`#FFB02E`
  - 神话 / 限定：`#FF4B8E`
  - 用途：装备边框与名称、掉落提示、卡片品质条等，品质色主要用于**局部描边与图标**，避免大面积铺底。

### 2. Typography（字体排印）

- **Font Family（字体族）**
  - 中文优先级建议：`\"HarmonyOS Sans SC\", \"MiSans\", \"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif`
  - 西文与数字使用同一字体族内的西文子集，保持笔画粗细与中文风格一致。
  - 禁止：用艺术字/书法体承载长文本或属性说明。

- **Type Scale（字号层级，基于 720×1600）**
  - H1 一级标题（一级界面主标题）：24px / 行高 30px  
  - H2 二级标题（模块标题）：20px / 行高 26px  
  - H3 三级标题：18px / 行高 24px  
  - 正文：16px / 行高 22–24px，用于主要说明文本与按钮文字  
  - 次正文 / 辅助说明：14px / 行高 20px  
  - 标签 / 徽章：12px / 行高 16px
  - 约束：单屏内最多使用 4 个字号层级，保持信息层级清晰。

- **Alignment & Usage（对齐与用法）**
  - 标题与正文默认左对齐；数值类（战斗力、金币、属性值）右对齐便于比较。
  - 英文与数字混排时，保持基线统一；百分比、单位紧跟数值书写。
  - 大段说明文案应拆分段落，单行长度建议控制在 24–36 个全角字符。

### 3. Iconography（图标风格）

- **App Icon（应用图标）**
  - 轮廓：遵循各平台圆角蒙版，内部主体集中在图标中间 60% 区域。
  - 构图：二次元角色半身像 + 暖金边框 + 深蓝 / 深紫背景，三层视觉：背景 → 角色 → 前景光效。
  - 对比：保证在色彩杂乱的桌面中依然清晰可辨，避免过多细节被系统压缩后糊成一团。

- **In‑Game Icons（游戏内功能 / 系统图标）**
  - 风格：2px 左右描边的扁平图标，轻内阴影与少量高光；视角统一（正视或 45° 俯视），避免多种风格混用。
  - 选中态：描边或底板使用主金色，整体亮度略提升；禁用态降低不透明度并去掉高光。
  - 红点通知：统一使用直径 10–12px 的红点（`#FF4B4B`），位置在图标右上角，不遮挡图标主体。

## Layout Guidelines (720×1600 Vertical)

> 本节用于定义竖版 720×1600 屏幕下的基础布局模式与信息分区。

### 1. Safe Area & Global Structure

- 逻辑分辨率：720×1600，竖屏，为所有 UI 布局设计基准。
- 顶部安全区：预留系统状态栏与刘海区域（约 48–64px），不放主交互控件。
- 底部安全区：预留手势导航区域（约 32px），主要操作按钮上移。
- 全局左右边距：内容区域距屏幕左右边缘不小于 24px。

### 2. Screen Levels & Information Density

- **Level 1（一级界面：系统主界面）**
  - 组成：顶部主标题 + 货币栏 / 全局状态条 + 中部主内容 + 底部主导航或操作区。
  - 信息密度：低～中，强调导航与发现，避免长段文字。
- **Level 2（二级界面：详细列表/详情）**
  - 自一级进入，包含可滚动内容（列表、卡片等）。
  - 信息密度：中，合理分组，建议通过卡片或分组标题组织信息。
- **Level 3（三级界面：弹窗/配置面板）**
  - 以弹窗或底部弹出的面板为主，不占满全屏，明确目的与操作（通常 1～2 个主按钮）。
  - 信息密度：可以较高，但操作路径应简短清晰。

### 3. Common Layout Patterns

- **列表布局（任务列表 / 邮件 / 日志）**
  - 单行高度：72–96px，包含图标、标题、副标题、右侧数值或按钮。
  - 行间距：8–12px，通过分割线或浅底板区分。
  - 顶部常见元素：筛选、排序、标签页。

- **网格布局（背包 / 技能格子 / 仓库）**
  - 每行 4–5 列，单格子宽高 96–120px，格子间距约 8px。
  - 选中格子高亮边框（使用品质色或主金色）+ 轻微外发光。
  - 下方可预留 25–35% 高度展示选中物品详情或快捷操作。

- **左右分栏布局（角色 / 队伍配置）**
  - 左侧：角色 3D 模型或立绘区域（占宽度 45–55%）。
  - 右侧：属性列表、装备栏、操作按钮；保证右侧可滚动时左侧保持固定。
  - 左右分栏间距：16–24px，避免视觉拥挤。

- **底部操作栏**
  - 高度：72–88px（不含安全区）。
  - 内容：1 个主按钮 + 1–2 个次按钮或图标按钮，避免超过 3 个主操作。
  - 按钮之间至少 12px 水平间距，防止误触。

## Motion & Transitions

> 本节定义 UI 动效与界面转场的统一规则，重点保证爽快感与操作响应。

### 1. General Principles

- 不阻塞交互：动效不应阻碍玩家进行下一步关键操作，必要时可以中途打断或跳过。
- 可感知但不拖沓：普通 UI 转场时长控制在 200–300ms 内，玩家能明显感知层级变化但不会觉得拖沓。
- 一致性：相同类型的界面切换（如一级→二级）使用统一的方向、曲线与时长。

### 2. Duration & Easing

- 微交互（按钮点击、页签切换、红点出现）：80–160ms，`ease-out`。
- 二级 / 三级弹窗进出场：200–250ms，缩放 0.95→1.0 + 淡入；关闭时 160–200ms 淡出 + 轻微下移。
- 一级界面切换（如“主城”→“背包”）：240–320ms，横向滑入 / 滑出或淡入 + 水平位移。
- 长动画（抽卡 / 强化演出）：500–1200ms，必须提供“加速 / 跳过”选项。

### 3. Transition Patterns

- 一级 → 二级：
  - 二级界面自下向上推入，同时一级界面稍微缩暗或微缩，形成层级感。
  - 返回时采用反向动画，保持方向一致性。
- 二级 → 三级：
  - 以居中弹窗或底部面板形式出现，使用缩放 + 淡入，叠加半透明遮罩强化焦点。
- Toast / 飘字提示：
  - 自屏幕中上区域轻微上浮 + 淡入，停留 1.2–1.6 秒后淡出；不遮挡主要交互区域。

### 4. Component Animations

- 按钮：按下时缩放至 0.95，亮度略降低，释放时弹回，整个过程 80–120ms。
- 页签：下划线在 160–200ms 内滑动到新标签下，文字颜色渐变。
- 列表滚动：采用系统原生惯性滚动，不额外叠加过度摇晃或弹跳效果。

### 5. Performance & Degradation

- 低性能设备或高负载场景下，可自动降低非关键动效（背景循环、复杂发光），保留基础的点击反馈与界面转场。
- 提供“减少动效”设置项，关闭非必要的粒子、长演出。

## Components Guidelines

> 本节统一描述页签、按钮、展示类、输入类与容器类控件的行为与样式，供所有界面复用。

### 1. Tabs（页签）

- 高度：40–48px，触控区域不小于 44×44px。
- 文字字号：14–16px。
- 未选中：文字颜色 `#C2C5CD`，下划线隐藏或透明。
- 选中：文字主金色，下划线 2px，颜色主金色或品质色，支持轻微发光。
- 滚动页签：当页签数 >5 时允许横向滑动，两侧使用渐隐或箭头提示有更多内容。

### 2. Buttons（按钮）

- 主按钮（Primary）
  - 用途：最关键正向操作，如「开始战斗」「确定」「抽十次」。
  - 背景：暖金渐变，圆角胶囊，宽度≥200px，高度 44–52px。
  - 状态：正常 / 悬停 / 按下 / 禁用 4 态样式需明确定义。
- 次按钮（Secondary）
  - 用途：非关键但常用操作，如「详情」「预览」「换一批」。
  - 背景：深蓝 / 深紫，描边略带金色或浅色，大小略小于主按钮。
- 危险按钮（Danger）
  - 用途：删除、退出、解散等不可逆操作，必须搭配二次确认。
  - 背景：红色半透明 + 内阴影，禁用态应明显灰化。
- 幽灵按钮（Ghost）
  - 用途：弱操作或辅助入口，如「更多设置」「查看帮助」。
  - 样式：透明底 + 描边（主金色或中性色）+ 浅色文字。

### 3. Display Components（展示类）

- 标签 / 徽章（Tag / Badge）
  - 用于显式展示状态、阵营、品质等信息。
  - 高度 18–20px，内边距左右 8–10px，圆角胶囊。
  - 颜色与语义 / 品质色板对应。
- 进度条（Progress / HP / MP / EXP）
  - 高度 8–16px，圆角矩形；背景浅色，填充使用语义色。
  - 必须配合数值文字展示（如“75%”“123/200”），不能只依赖颜色。
- 提示条（Notification Bar / Tip）
  - 出现在顶部或底部，用于系统公告、活动提示。
  - 背景与重要程度对应：强提示用金 / 红，弱提示用深蓝。

### 4. Input Components（输入类）

- 文本输入框（Text Field）
  - 场景：聊天、公会公告、角色名、搜索等。
  - 高度 40–44px，圆角 6–8px；背景深色半透明，获得焦点时描边主金色。
  - 错误时描边红色，并在下方或右侧展示简短错误文案。
- 下拉选择（Dropdown）
  - 收起态为按钮 + 向下箭头，展开为垂直列表，单项高度 36–40px。
  - 选中项高亮，Hover 态有浅色背景。
- 开关（Toggle）
  - 尺寸：宽 40–52px，高 22–28px，圆角胶囊。
  - ON：轨道主金色 + 白色滑块；OFF：轨道深灰 + 浅灰滑块。
- 滑块（Slider）
  - 用于音量、亮度、灵敏度等连续值。
  - 轨道高度 4–6px，滑块直径 16–20px，拖动时展示当前数值。

### 5. Containers（容器类）

- 卡片（Card）
  - 用于展示角色、装备、任务等结构化信息。
  - 背景深色半透明 + 圆角 12px + 统一阴影；选中卡片提升亮度与阴影。
- 列表行（List Item）
  - 一般结构：左图标 / 头像 + 中标题 / 副标题 + 右数值 / 图标按钮。
  - 选中或激活状态使用浅色背景 / 左边色条 / 描边区分。
- 弹窗（Dialog）
  - 包含标题区、内容区、按钮区。内容区可滚动，按钮区固定在底部。
  - 宽度建议为屏宽的 80–90%，高度不超过屏幕的 80%。
- 底部面板（Bottom Sheet）
  - 自底部滑出，覆盖屏幕下方 50–70%，顶部有拖拽指示条。

## Surface & Texture（底板与纹理）

### 1. Surface Levels

- Level 0：游戏世界 / 战斗背景，不直接承载文本，需要通过遮罩降低亮度。
- Level 1：HUD 与轻量面板，背景透明度 0.65–0.75，弱阴影。
- Level 2：主界面面板，背景接近不透明，清晰的描边与阴影。
- Level 3：弹窗与系统级对话框，最强的遮罩和阴影层级。

### 2. 基础底板样式

- 使用大圆角矩形作为默认底板形态，圆角 8–16px。
- 采用低对比度描边和阴影提升层级感，而非堆叠多层描边。
- 复杂背景（插画、3D 场景）上必须叠加深色遮罩后再放置底板与文本。

### 3. 纹理与光效

- 大面积区域使用低对比度噪点或几何纹理（透明度不超过 8–10%），避免干扰主内容。
- 高品质奖励、重要结果界面可以叠加高亮金属边框与光效，但同屏“极高亮”区域不超过 2 处。
- 战斗 HUD 核心区域（血条、技能按钮）后面避免使用闪烁或高对比度动态纹理。

## Quality Checklist

When designing or reviewing interfaces:

- [ ] Interaction follows defined hierarchy (1→2→3)
- [ ] Feedback is provided for all user actions
- [ ] Error states have clear recovery paths
- [ ] Touch targets meet minimum size requirements
- [ ] Color contrast meets accessibility standards
- [ ] Terminology is consistent with existing screens
- [ ] Loading states are visually distinct
- [ ] Destructive actions require confirmation
- [ ] Animation duration is appropriate (200-400ms)
- [ ] Audio feedback is balanced and pleasant
- [ ] Visual design follows the defined color palette and typography scale for 720×1600
- [ ] Layout respects safe areas and recommended margins on vertical screens
- [ ] Components (tabs, buttons, inputs, containers) use the standardized styles and states
- [ ] Motion timing and transition patterns match the Motion & Transitions guidelines
- [ ] Surface levels and textures do not interfere with content legibility or interaction

## Documentation Reference

For detailed templates and examples, see:
`[../templates/interaction-spec-template.md](../templates/interaction-spec-template.md)`

## Evolution and Updates

These standards evolve based on:
- User testing feedback
- Platform best practices
- New interaction patterns
- Team consensus on improvements

Maintain version history for significant updates to track evolution.

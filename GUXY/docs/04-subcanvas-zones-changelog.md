# 子画布三区域容器修改记录

## 修改日期
2025-02-09

## 修改概述

参考 PiaJi 实现，将子画布重构为**一级界面、二级界面、三级界面**三块区域容器，支持：
1. 三块区域容器布局
2. AI 分析生成架构后按 `interface_level` 自动落入对应区域
3. 拖拽卡片跨区域移动，鼠标所在区域边缘高亮
4. 同一区域内卡片纵向排列、横向居中

---

## 修改的文件列表

### 1. 新增文件

#### GUXY/modules/canvas/SubCanvasZones.js
**功能**：子画布区域容器管理模块

**主要方法**：
- `getCardZone(card)` - 根据卡片的 `interface_level` 返回所属区域
- `detectZoneFromPosition(canvasX, canvasY)` - 根据画布坐标检测所在区域
- `createZoneContainers(parent, insertBefore)` - 创建三块区域 DOM 容器
- `removeZoneContainers()` - 移除区域容器
- `highlightZone(zoneKey)` - 高亮指定区域边缘（拖拽时反馈）
- `clearHighlight()` - 清除高亮
- `zoneToInterfaceLevel(zoneKey)` - 区域键转 `interface_level`

**配置**：
- `ZONE_COLUMN_WIDTH`: 280px
- `ZONE_HEIGHT`: 2400px

---

### 2. 修改文件

#### GUXY/modules/canvas/SubCanvas.js
**改动**：
- 从四列布局改为**三块区域**（一级/二级/三级界面）
- 移除「界面信息」列，hint 卡片放入三级界面区域
- 创建并集成 `SubCanvasZones` 区域容器
- 布局：同一区域内卡片**纵向排列、横向居中**
- 关闭/返回主画布时移除区域容器并清除高亮
- 区域标签改为三块，并附加到 `canvas-transform` 以随画布平移缩放

#### GUXY/modules/canvas/Nodes.js
**改动**：
- 子画布模式下拖拽卡片时，根据卡片中心位置检测鼠标所在区域
- 拖拽过程中：`SubCanvasZones.highlightZone()` 高亮对应区域边缘
- 松手时：若检测到跨区域，更新卡片的 `interface_level`，调用 `SubCanvas.render()` 重新布局

#### GUXY/styles/canvas.css
**新增样式**：
- `.subcanvas-zone-container` - 区域容器外层
- `.subcanvas-zone` - 单块区域
- `.subcanvas-zone-level1/level2/level3` - 三块区域颜色区分
- `.subcanvas-zone.highlighted` - 拖拽时的边缘高亮样式

#### GUXY/online/index.html
**改动**：
- 在 SubCanvas.js 之前引入 `SubCanvasZones.js`

---

## 数据流说明

### AI 分析 → 架构生成
- `AIAnalysis` 输出的模块/界面数据中包含 `interface_level`（1/2/3）
- `ArchitectureGen.generateFromAnalysis()` 将 `interface_level` 写入卡片
- 子画布打开时，按 `interface_level` 将卡片放入对应区域

### 拖拽跨区域
1. 用户拖拽卡片
2. `onMove`：计算卡片中心画布坐标 → `detectZoneFromPosition` → `highlightZone`
3. `onUp`：计算松手位置所在区域 → 若与当前区域不同，更新 `card.interface_level` → `SubCanvas.render()` 重新布局

---

## 布局规则

| 区域     | interface_level | 卡片类型       |
|----------|-----------------|----------------|
| 一级界面 | 1               | screen         |
| 二级界面 | 2               | screen         |
| 三级界面 | 3 或 hint       | screen / hint  |

同一区域内：卡片纵向排列（自上而下），横向居中（`x = 区域原点.x + (区域宽度 - 卡片宽度) / 2`）。

---

## 参考
- PiaJi/online/index.html：区域容器、`detectZoneFromPosition`、拖拽高亮逻辑

---

## 2025-02-09 修复记录

### 1. 子画布自动布局
- **问题**：点击自动布局后卡片位置错乱，需重新进入子画布才恢复
- **修复**：`Toolbar.autoLayout()` 在子画布模式下改为调用 `SubCanvas.render()`，保持三区域布局

### 2. 卡片纵向间距
- **问题**：卡片间距离过近
- **修复**：`CARD_GAP` 从 16 调整为 36

### 3. 子画布连线方向
- **问题**：连线方向不明确
- **修复**：一级→二级、二级→三级使用 sourcePosition: 'right', targetPosition: 'left'；反向使用 left→right

### 4. 子画布中岛台显示
- **问题**：子画布下仍显示导入策划案、导入架构、导出架构、生成规划
- **修复**：`CentralToolbar.render()` 根据 `SubCanvas.isSubCanvasMode` 隐藏上述按钮；在 SubCanvas 打开/关闭时调用 `CentralToolbar.refresh()`

---

## 2025-02-09 视觉优化记录

### 1. 去掉外描边，增大圆角
- **文件**：`styles/canvas.css`
- **修改**：
  - 集合节点：`border: none`，`border-radius: var(--radius-lg)`（原为 var(--radius-sm)）
  - 卡片节点：`border: none`，`border-radius: var(--radius-lg)`（原为 var(--radius-sm)）

### 2. 减小卡片晃动幅度
- **文件**：`styles/canvas.css`
- **修改**：调整 `nodeFloatA` 和 `nodeFloatB` 动画 keyframes
  - 原：translateY 最大 5px，translateX 最大 3px
  - 新：translateY 最大 1.5px，translateX 最大 0.5px

### 3. 黑-黄-白配色 + 点阵纹理
- **文件**：`styles/variables.css`, `styles/canvas.css`
- **修改**：
  - 背景：`#0a0a0a`（深黑）
  - 面板：`#141414`（深灰黑）
  - 卡片：`#1a1a1a`（深灰）
  - 文本：`#f5f5dc`（奶白）
  - 次文本：`#a0a090`（浅奶黄）
  - 主高亮：`#fbbf24`（蜜黄）
  - 节点类型色：系统(#cc991e)、战斗(#a89032)、剧情(#7a7a0f)、层级(#917d1f)
  - 连线色：默认(#7a7a0f)、高亮(#fbbf24)
  - 画布网格：从双线渐变改为点阵纹理 `radial-gradient`
  - 光晕：从黄绿改为深黄/蜜黄

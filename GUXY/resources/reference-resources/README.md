# 参考资源

> 本目录存储设计和交互相关的参考资源，包括设计参考图、竞品分析和交互模式库。

---

## 目录结构

```
reference-resources/
├── references/          # 设计参考图
├── competitive/         # 竞品分析资料
└── patterns/           # 交互模式库
```

---

## references/

### 用途
存储优秀的设计参考图，作为设计灵感和标准。

### 命名规范
```
[类型]_[描述/场景].[扩展名]
```

**示例**:
- `mobile_navigation_pattern.png`
- `game_ui_style_reference.jpg`
- `inventory_design_inspiration.pdf`

### 分类

#### 界面类型参考
```
[界面类型]_reference.[扩展名]
```

**类型列表**:
- `mainmenu` - 主菜单
- `inventory` - 背包系统
- `character` - 角色系统
- `skill` - 技能系统
- `battle` - 战斗系统
- `quest` - 任务系统
- `settings` - 设置界面
- `shop` - 商店系统

#### 交互模式参考
```
[pattern]_reference.[扩展名]
```

**模式列表**:
- `navigation` - 导航模式
- `dropdown` - 下拉菜单
- `modal` - 模态框
- `toast` - 提示消息
- `swipe` - 手势操作
- `drag_drop` - 拖拽操作

#### 风格参考
```
[风格]_style_reference.[扩展名]
```

**风格列表**:
- `minimalist` - 极简风格
- `cartoon` - 卡通风格
- `realistic` - 写实风格
- `pixel_art` - 像素风格
- `cyberpunk` - 赛博朋克
- `fantasy` - 奇幻风格

### 参考图标准

**图片质量**:
- 最小分辨率: 1280x720
- 推荐分辨率: 1920x1080或更高
- 格式: PNG / JPG

**设计原则**:
- 清晰的布局结构
- 明确的视觉层次
- 良好的色彩搭配
- 优秀的用户体验

**标注内容**:
- 关键尺寸标注
- 交互流程说明
- 设计亮点标注
- 可借鉴点说明

---

## competitive/

### 用途
存储竞品分析资料，了解市场趋势和最佳实践。

### 命名规范
```
[游戏名称]_[系统/界面]_analysis.[扩展名]
```

**示例**:
- `gameA_inventory_analysis.pdf`
- `gameB_navigation_pattern.md`
- `gameC_battle_system_comparision.pptx`

### 分析内容模板

每个竞品分析应包含：

#### 基本信息
```markdown
## 基本信息
- **游戏名称**: [名称]
- **开发商**: [开发商]
- **发布日期**: [日期]
- **平台**: [平台列表]
- **类型**: [游戏类型]
```

#### 系统分析
```markdown
## [系统名称]分析

### 功能概述
- 核心功能: [描述]
- 特色功能: [描述]

### 交互设计
- 导航方式: [描述]
- 操作方式: [描述]
- 反馈机制: [描述]

### 视觉设计
- 色彩方案: [描述]
- 界面风格: [描述]
- 元素设计: [描述]

### 优点
- [优点1]
- [优点2]

### 缺点
- [缺点1]
- [缺点2]

### 可借鉴点
- [借鉴点1]
- [借鉴点2]
```

### 竞品清单

**竞品A**:
- `gameA_inventory_analysis.pdf`
- `gameA_battle_system.md`
- `gameA_navigation_pattern.png`

**竞品B**:
- `gameB_character_system.pdf`
- `gameB_shop_interface.md`
- `gameB_settings_pattern.png`

### 分析维度

#### 功能维度
- 功能完整性
- 功能创新性
- 功能易用性

#### 交互维度
- 交互一致性
- 交互直观性
- 交互流畅性

#### 视觉维度
- 视觉吸引力
- 信息层次
- 色彩搭配

#### 性能维度
- 加载速度
- 动画流畅度
- 内存占用

---

## patterns/

### 用途
存储可复用的交互模式，提高设计一致性和开发效率。

### 命名规范
```
[pattern名称]_pattern.[扩展名]
```

**示例**:
- `pull_to_refresh_pattern.md`
- `swipe_gesture_pattern.md`
- `modal_dialog_pattern.png`

### 交互模式分类

#### 导航模式

**Tab导航** (`tab_navigation_pattern.md`)
```
模式名称: Tab导航
适用场景: 平级内容切换
交互方式: 点击Tab切换内容
视觉反馈: Tab下划线/背景色变化
```

**侧边栏导航** (`sidebar_navigation_pattern.md`)
```
模式名称: 侧边栏导航
适用场景: 多级内容组织
交互方式: 点击侧边栏项目
视觉反馈: 选中项高亮
```

**面包屑导航** (`breadcrumb_navigation_pattern.md`)
```
模式名称: 面包屑导航
适用场景: 深层级界面
交互方式: 点击路径快速跳转
视觉反馈: 当前层级高亮
```

#### 操作模式

**下拉菜单** (`dropdown_menu_pattern.md`)
```
触发方式: 点击/悬停
展开动画: 从上到下淡入
关闭方式: 点击外部/点击选项
选项高亮: 悬停/选中
```

**模态对话框** (`modal_dialog_pattern.md`)
```
背景遮罩: 半透明黑色
打开动画: 从中心缩放进入
关闭方式: 点击遮罩/点击取消/ESC键
焦点管理: 打开后聚焦对话框
```

**侧滑菜单** (`slide_menu_pattern.md`)
```
打开方式: 滑动手势/点击按钮
滑出方向: 从左/右侧滑出
关闭方式: 滑动手势/点击遮罩
动画时长: 300ms
```

#### 手势模式

**下拉刷新** (`pull_to_refresh_pattern.md`)
```
触发距离: 下拉80px
刷新指示器: 旋转图标/文字提示
释放刷新: 超过阈值释放
刷新动画: 旋转动画
完成反馈: 显示"刷新成功"
```

**滑动删除** (`swipe_to_delete_pattern.md`)
```
滑动方向: 向左/向右滑动
删除按钮: 滑动后显示
确认机制: 点击删除按钮确认
撤销功能: 删除后提供撤销
```

**长按操作** (`long_press_action_pattern.md`)
```
触发时长: 长按500ms
触觉反馈: 震动
视觉反馈: 元素放大/透明度降低
操作菜单: 显示操作选项
```

#### 加载模式

**骨架屏** (`skeleton_loading_pattern.md`)
```
适用场景: 数据加载前占位
视觉样式: 灰色占位块
动画效果: 闪烁动画
替换方式: 数据加载完成后平滑替换
```

**无限滚动** (`infinite_scroll_pattern.md`)
```
触发条件: 滚动到底部附近
加载指示器: 底部显示loading
数据追加: 追加到现有列表
加载完成: 显示"已加载全部"
```

**分页加载** (`pagination_loading_pattern.md`)
```
分页方式: 数字页码/上一页下一页
当前页指示: 高亮当前页码
边界处理: 首页/末页禁用相应按钮
```

#### 反馈模式

**Toast提示** (`toast_notification_pattern.md`)
```
显示位置: 屏幕顶部/底部
显示时长: 2-3秒
动画效果: 从上/下滑入淡出
类型区分: 成功/警告/错误不同颜色
```

**工具提示** (`tooltip_pattern.md`)
```
触发方式: 悬停元素
显示延迟: 300ms
显示位置: 元素上方/下方/左侧/右侧
关闭方式: 移出元素/点击
```

**徽章通知** (`badge_notification_pattern.md`)
```
显示位置: 图标右上角
样式: 红色圆形背景
数字显示: 超过99显示"99+"
清除方式: 查看通知后自动清除
```

### 模式文档模板

```markdown
# [模式名称]

## 基本信息
- **模式类型**: [类型]
- **适用场景**: [场景描述]
- **常见度**: [普遍/常见/较少]

## 交互描述
### 触发方式
- [触发方式1]
- [触发方式2]

### 交互行为
- [行为1]
- [行为2]

### 反馈机制
- [反馈1]
- [反馈2]

## 视觉规范
### 元素设计
- [元素1]: 描述
- [元素2]: 描述

### 动画效果
- [动画1]: 时长[数值]ms
- [动画2]: 时长[数值]ms

## 可访问性
- [可访问性要点1]
- [可访问性要点2]

## 代码示例
### HTML结构
```html
<!-- 示例代码 -->
```

### CSS样式
```css
/* 示例代码 */
```

## 参考实现
- [参考项目1]
- [参考项目2]

## 注意事项
- [注意点1]
- [注意点2]
```

---

## 资源管理

### 版本控制

**提交策略**:
- 原始文件提交到版本库（SVN）
- 大文件使用 LFS 或单独存储策略
- 保持清晰的文件命名

**文件格式**:
- 图片: PNG / JPG
- 文档: PDF / MD
- 设计稿: SKETCH / FIGMA / XD

### 资源更新

**定期更新**:
- 每月收集新的设计参考
- 每季度更新竞品分析
- 持续丰富交互模式库

**质量筛选**:
- 确保参考资源的质量
- 选择最佳实践案例
- 避免过时或低质量资源

### 分享和协作

**团队共享**:
- 设计团队定期分享优秀参考
- 收集团队成员的竞品分析
- 建立共同的设计语言

**外部资源**:
- 订阅设计网站和博客
- 关注行业设计趋势
- 参加设计会议和活动

---

## 资源索引

创建`index.md`文件，列出所有参考资源：

```markdown
# Reference Resources Index

## References
- mobile_navigation_pattern.png
- game_ui_style_reference.jpg

## Competitive Analysis
- gameA_inventory_analysis.pdf
- gameB_navigation_pattern.md

## Patterns
- pull_to_refresh_pattern.md
- swipe_gesture_pattern.md
- modal_dialog_pattern.md
```

---

## 推荐资源网站

### 设计灵感
- Dribbble - 设计作品分享
- Behance - 优秀设计案例
- Awwwards - 网站设计奖项
- Mobbin - 移动应用设计参考

### 交互模式
- Pattern Tap - 交互模式库
- UI Patterns - 设计模式集合
- Material Design - Google设计规范
- Apple Human Interface - Apple设计规范

### 游戏UI
- Game UI Database - 游戏UI数据库
- Interface in Game - 游戏界面案例
- ArtStation - 游戏美术作品

### 竞品分析
- Sensor Tower - 移动应用数据
- App Annie - 应用市场数据
- Steam Charts - Steam游戏排行

---

## 联系方式

如有参考资源相关问题，请联系：
- 设计负责人: [姓名]
- 邮箱: [邮箱]
- 协作平台: [Figma/Sketch/其他]

---

**版本**: v1.0
**更新日期**: 2026-02-05

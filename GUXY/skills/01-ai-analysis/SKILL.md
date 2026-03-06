---
name: ai-analysis
description: Analyze game design documents using LLM to extract and complete interactive logic, then output standardized interaction records. Use when processing design documents, planning phases, or when the user mentions analyzing interactive logic from design specs.
---

# AI Analysis of Design Documents

## Purpose

Analyze game design documents to extract, understand, and complete interactive logic using large language models.

## Core Concepts

### 功能集合 vs 界面卡片

- **功能集合**: 一个具体的功能领域或功能模块（如"装备强化功能"、"任务系统功能"、"商城功能"）
  - 集合代表一个完整的功能系统
  - 包含多个相关的界面
  - 有明确的功能目的和交互目标

- **界面卡片**: 一个具体的用户界面（如"装备强化界面"、"装备洗炼界面"、"任务列表界面"）
  - 卡片代表一个可见的界面
  - 包含具体的UI元素和信息展示
  - 是功能集合的组成部分

### 分析层次

```
功能集合（功能模块）
  ├─ 界面卡片1（具体界面）
  ├─ 界面卡片2（具体界面）
  └─ 界面卡片3（具体界面）
```

## Analysis Workflow

1. **Read the design document**
   - Identify the document type (design doc, feature spec, etc.)
   - Extract key requirements and feature descriptions
   - Note any missing or ambiguous information

2. **Analyze with LLM**
   - Use the configured LLM to process the document content
   - Apply the interactive logic analysis framework from the domain knowledge
   - Identify functional modules and their relationships

3. **Complete interactive logic**
   - Fill in missing interaction details based on best practices
   - Suggest standard patterns for common interactions
   - Document any assumptions made during completion

4. **Generate standardized output**
   - Follow the interactive logic records template
   - Structure output for use in the next workflow step
   - Include all relevant context for architecture generation

## Detailed Analysis Guidelines

### 功能集合分析

每个功能集合必须包含：

1. **功能名称**: 明确、简洁的名称（如"装备强化功能"）
2. **功能描述**: 详细说明以下内容：
   - **功能目的**: 这个功能要解决什么问题，达到什么效果
   - **交互方式**: 玩家如何使用这个功能，主要操作流程
   - **涉及界面**: 包含哪些具体的界面，如强化界面、洗炼界面等
   - **数据流向**: 数据如何流动，涉及哪些关键数据

**示例**:
```
名称: 装备强化功能
描述: 该功能允许玩家通过消耗材料和金币来强化装备，提高装备属性。
主要交互包括：在装备列表中选择要强化的装备、选择强化材料、
点击强化按钮、查看强化结果和属性变化。
涉及的界面包括：装备选择界面、强化材料界面、强化确认界面、强化结果界面。
数据流向包括：从背包获取装备和材料、计算强化成功率和属性提升、
更新装备属性、消耗材料和金币。
```

### 界面卡片分析

每个界面卡片必须包含：

1. **界面名称**: 明确、具体的界面名称（如"装备强化界面"）
2. **所属模块**: 关联到具体的功能集合
3. **界面层级**: 
   - 1级：主要入口界面（如主界面、功能选择界面）
   - 2级：功能操作界面（如强化界面、列表界面）
   - 3级：详细信息或设置界面（如详情页、设置页）
4. **界面类型**: 
   - screen：正常显示的界面
   - hint：提示信息或临时显示的内容
5. **界面描述**: 详细说明以下内容：
   - **显示信息**: 界面上显示的所有信息项（如装备名称、属性值、强化等级）
   - **交互元素**: 按钮、输入框、下拉菜单、滑块、列表、图标等具体元素
   - **布局结构**: 信息如何排列，顶部显示什么，中间显示什么，底部显示什么
   - **数据展示**: 使用什么控件展示数据（如进度条、数字、图标、列表）

**示例**:
```
名称: 装备强化界面
所属模块: 装备强化功能
层级: 2
类型: screen
描述: 界面顶部显示当前选中的装备信息（装备图标、名称、当前等级、
基础属性、附加属性）。中间左侧显示装备槽位，玩家点击选择要强化的装备；
中间右侧显示强化材料列表，包含材料图标、名称、数量、选中状态，
支持点击选择材料。底部显示强化操作区，包含：强化按钮（显示消耗的
金币数量和材料）、强化成功率进度条、强化预览区域（显示强化后的
属性变化）。整个界面使用网格布局，信息清晰分层，操作按钮醒目。
数据展示方式：属性使用数字+进度条组合显示，材料数量使用徽标提示，
成功率使用百分比和颜色变化。
```

### 交互流程分析

每个流程步骤必须包含：

1. **步骤顺序**: 清晰的步骤编号（1, 2, 3...）
2. **操作描述**: 
   - 用户在哪个界面进行操作
   - 执行什么具体操作（点击按钮、选择选项、输入信息等）
3. **结果描述**: 
   - 操作后产生的结果
   - 跳转到哪个界面
   - 显示什么信息

**示例**:
```
步骤1:
  操作: 玩家在装备列表界面选择要强化的装备
  结果: 进入装备强化界面，显示选中装备的详细信息和当前属性

步骤2:
  操作: 玩家在装备强化界面点击材料选择按钮
  结果: 打开材料选择弹窗，显示可用的强化材料列表

步骤3:
  操作: 玩家在材料选择弹窗中选择需要的强化材料
  结果: 关闭材料选择弹窗，在装备强化界面显示已选材料及其数量

步骤4:
  操作: 玩家点击装备强化界面上的强化按钮
  结果: 执行强化操作，显示强化结果界面（成功/失败及属性变化）
```

## Interactive Logic Framework

When analyzing, focus on:
- **User flows**: Entry points, decision points, exit points
- **Interface hierarchy**: Primary, secondary, tertiary screens
- **State management**: What states exist, transitions between them
- **Feedback mechanisms**: Visual, audio, haptic feedback
- **Error handling**: User error scenarios and recovery paths

## Output Format

Generate output following the structure in:
`[../docs/01-interactive-logic-records.md](../docs/01-interactive-logic-records.md)`

Ensure:
- Clear module boundaries
- Explicit interaction steps
- Defined screen levels (1/2/3)
- Information display methods (hints, tooltips, overlays)
- Complete user journey from entry to completion

## Handling Ambiguity

If the design document is unclear:
- Document the ambiguity clearly
- Suggest multiple valid approaches when appropriate
- Prioritize solutions that match existing game patterns
- Note decisions for later review

## Integration with Next Step

The output is designed to feed into the architecture generation skill (02-architecture-gen), so maintain consistency in terminology and structure.

## Quality Checklist

Before completing analysis, verify:
- [ ] Every module is a concrete function (not a general category)
- [ ] Every screen is a concrete interface (not a feature description)
- [ ] Module descriptions include purpose, interaction, screens, and data flow
- [ ] Screen descriptions include displayed information, interactive elements, layout, and display methods
- [ ] Flow steps clearly indicate the interface being used and the operation performed
- [ ] Results describe where the user goes or what is displayed
- [ ] Screen levels follow the 1→2→3 hierarchy
- [ ] All screens are properly associated with their parent modules

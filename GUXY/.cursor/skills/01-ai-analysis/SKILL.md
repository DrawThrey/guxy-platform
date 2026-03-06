---
name: ai-analysis
description: Analyze game design documents using LLM to extract interactive logic in two stages: 1) Convert design document to TXT structure, 2) Generate interactive architecture from edited TXT. Use when processing design documents, planning phases, or when the user mentions analyzing interactive logic from design specs.
---

# AI Analysis of Design Documents

## Purpose

Analyze game design documents using a two-stage workflow: first convert the design document into a structured TXT format, then generate interactive architecture from the user-edited TXT structure.

## Analysis Workflow

### Stage 1: Convert Design Document to TXT Structure

1. **Read the design document**
   - Identify the document type (design doc, feature spec, etc.)
   - Extract key requirements and feature descriptions
   - Note any missing or ambiguous information

2. **Analyze with LLM**
   - Use the configured LLM to process the document content
   - Extract major systems, functions, and interfaces
   - Identify interface hierarchy (level 1/2/3)
   - Extract interface information (displayed data, interactive elements)

3. **Generate TXT Structure**
   - Format the extracted content into a structured TXT document
   - Include major systems (大系统) at the top level
   - List functions under each system
   - Detail interfaces with their hierarchy levels and contained information
   - Add interface jump logic at the end

### Stage 2: User Review and Edit

1. **Display TXT for Review**
   - Show the generated TXT structure in an editable format
   - Allow users to review and modify the content
   - Support adding/deleting/modifying systems, functions, interfaces

2. **User Actions**
   - **Confirm**: Proceed to generate interactive architecture
   - **Re-convert**: Go back to stage 1 and re-analyze the design document
   - **Cancel**: Abort the process

### Stage 3: Generate Interactive Architecture

1. **Read Edited TXT Structure**
   - Parse the user-edited TXT content
   - Validate the structure format

2. **Generate Architecture with LLM**
   - Use the TXT structure to generate interactive architecture
   - Follow strict rules for collections, cards, and links

## TXT Structure Format

The TXT structure must follow this exact format:

```
# 游戏策划案架构结构

## 大系统1：[系统名称]

### 功能1：[功能名称]

#### 界面1：[界面名称]（一级界面/二级界面/三级界面）
- 包含信息：
  - [信息项1]
  - [信息项2]

#### 界面2：[界面名称]（一级界面/二级界面/三级界面）
- 包含信息：
  - [信息项1]

### 功能2：[功能名称]
[...more interfaces...]

## 大系统2：[系统名称]
[...repeat system structure...]

---

## 界面跳转逻辑

1. [界面A] → [界面B]：[交互行为说明]
2. [界面B] → [界面C]：[交互行为说明]
[...more jump logic...]
```

### Structure Elements

**大系统**:
- Top-level system classification (e.g., "装备系统", "任务系统", "商城系统")
- Each system becomes a collection node in the architecture

**功能**:
- Specific function modules within a system (e.g., "装备强化", "装备洗炼")
- Functions organize related interfaces

**界面**:
- Specific interface within a function
- Must specify hierarchy level: 一级界面 (level 1), 二级界面 (level 2), or 三级界面 (level 3)
- Must list all displayed information items

**界面跳转逻辑**:
- List all interface jump relationships at the end
- Each line follows format: `[From] → [To]：[Interaction Action]`
- Interaction action must describe the specific user action (e.g., "点击强化按钮", "点击返回按钮")

## Architecture Generation Rules

### Collections (集合)

- Generate one collection per major system (大系统)
- Collection ID format: `collection-[system name in pinyin/english]`
- Collection type based on system nature: `system`, `combat`, `story`, `level`

### Cards (卡片)

- Generate one card per interface (界面)
- Card ID format: `card-[interface name in pinyin/english]`
- Cards must be created in the sub-canvas of their parent system (collection)
- Card type: `screen` (界面卡) or `hint` (提示卡)
- interface_level: `1` (level 1), `2` (level 2), or `3` (level 3)
- Card description must include all displayed information items, interactive elements, and layout structure

### Links (连线)

- Generate links based on the interface jump logic (界面跳转逻辑) from the TXT
- **collectionLinks**: Links between collections
- **cardLinks**: Links between cards (interfaces)
- **cardCollectionLinks**: Links from cards to collections
- Each link must have a `label` field describing the interaction action
- The label must match the interaction action description from the TXT

## Output Format

Generate output as architecture JSON compatible with PiaJi format:

```json
{
  "collections": [
    {
      "id": "collection-xxx",
      "title": "大系统名称",
      "type": "system",
      "description": "系统描述"
    }
  ],
  "cards": [
    {
      "id": "card-xxx",
      "title": "界面名称",
      "description": "界面描述，包含所有显示的信息项、交互元素、布局结构",
      "type": "screen",
      "interface_level": 1,
      "collection_id": "collection-xxx"
    }
  ],
  "cardLinks": [
    {
      "id": "link-xxx",
      "from_card_id": "card-xxx",
      "to_card_id": "card-yyy",
      "label": "点击强化按钮",
      "iconType": null
    }
  ],
  "collectionLinks": [
    {
      "id": "link-xxx",
      "from_collection_id": "collection-xxx",
      "to_collection_id": "collection-yyy",
      "label": "从主界面进入",
      "iconType": null
    }
  ],
  "cardCollectionLinks": [
    {
      "id": "link-xxx",
      "from_card_id": "card-xxx",
      "to_collection_id": "collection-yyy",
      "label": "返回主界面",
      "iconType": null
    }
  ]
}
```

## Quality Requirements

- All IDs must be unique
- All `collection_id` must reference valid collection IDs
- All link references (from_card_id, to_card_id, from_collection_id, to_collection_id) must point to existing nodes
- Link labels must accurately describe the interaction action from the TXT
- Strictly follow the jump logic defined in the TXT document

## Handling Ambiguity

If the design document is unclear:
- Document the ambiguity clearly in the TXT structure
- Suggest multiple valid approaches when appropriate
- Prioritize solutions that match existing game patterns
- Let the user review and edit the TXT before generating architecture

## Integration with Next Step

The output architecture is designed to be rendered directly on the canvas by the ArchitectureGen module, maintaining consistency with the PiaJi architecture format.

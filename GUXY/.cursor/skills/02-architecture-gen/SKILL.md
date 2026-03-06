---
name: architecture-generation
description: Generate card-based interactive architecture from TXT structure. Create collections, cards, and links following PiaJi architecture format with auto-layout support. Use when generating architecture JSON from edited TXT structure or when user mentions creating interactive architecture.
---

# Architecture Generation from TXT Structure

## Purpose

Transform user-edited TXT structure into editable card-based interactive architecture following the PiaJi architecture format.

## Input Requirements

Use TXT structure from the two-stage AI analysis workflow:
- TXT format containing major systems (大系统)
- Functions under each system (功能)
- Interfaces with hierarchy levels (界面)
- Interface jump logic (界面跳转逻辑)

## TXT Structure Format

The input TXT must follow this structure:

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

## Architecture Structure

Follow the PiaJi architecture JSON format:

```json
{
  "collections": [
    {
      "id": "unique-id",
      "title": "系统名称",
      "type": "system", // system, combat, story, level
      "description": "Description here"
    }
  ],
  "cards": [
    {
      "id": "unique-id",
      "title": "Screen Title",
      "description": "Description",
      "type": "screen", // screen or hint
      "interface_level": 1, // 1, 2, or 3
      "collection_id": "parent-collection-id"
    }
  ],
  "cardLinks": [
    {
      "id": "unique-id",
      "from_card_id": "card-id-1",
      "to_card_id": "card-id-2",
      "label": "Navigation description",
      "iconType": null
    }
  ],
  "collectionLinks": [
    {
      "id": "unique-id",
      "from_collection_id": "collection-id-1",
      "to_collection_id": "collection-id-2",
      "label": "Entry description",
      "iconType": null
    }
  ],
  "cardCollectionLinks": [
    {
      "id": "unique-id",
      "from_card_id": "card-id",
      "to_collection_id": "collection-id",
      "label": "Navigation description",
      "iconType": null
    }
  ]
}
```

## Generation Rules

### 1. Collections (功能集合) - Strictly Follow Major Systems

- **One collection per major system (大系统)** from TXT
- Collection ID format: `collection-[system name in pinyin/english]`
- Set appropriate type based on system nature: `system`, `combat`, `story`, `level`
- Each collection represents a major feature area
- Collections are top-level nodes in the architecture

### 2. Cards (界面卡片) - Generate in Sub-Canvas

- **One card per interface (界面)** from TXT
- Card ID format: `card-[interface name in pinyin/english]`
- Cards must be created in the **sub-canvas of their parent system (collection)**
- Screen cards: Display actual interfaces (type: `screen`)
- Hint cards: Information display (type: `hint`)
- Set `interface_level` correctly based on TXT:
  - `1` for 一级界面 (primary entry points)
  - `2` for 二级界面 (secondary interfaces)
  - `3` for 三级界面 (detail views)
- `description` must include all listed information items from TXT
- Link to appropriate `collection_id` (parent system)

### 3. Links (连线) - Strictly Follow Jump Logic

- Generate links **strictly based on the interface jump logic (界面跳转逻辑)** at the end of TXT
- **cardLinks**: Navigation between screens (card to card)
- **collectionLinks**: Entry points between collections (collection to collection)
- **cardCollectionLinks**: Direct links from cards to collections
- All links must include clear `label` describing the interaction action
- The `label` must match the interaction action description from TXT (e.g., "点击强化按钮", "点击返回按钮")

### 4. Hierarchy Compliance

- Level 1 screens: Primary entry points within a system
- Level 2 screens: Secondary interfaces accessed from level 1
- Level 3 screens: Detail views accessed from level 2
- Hint cards can appear at any level

### 5. ID Consistency

- All IDs must be unique across the entire architecture
- All `collection_id` references must point to valid `collections[].id`
- All link references must point to valid nodes

## Auto-Layout Support

Generate positions for automatic layout:
- Use `position: { x: number, y: number }` for each node
- Organize cards in collection canvas by columns: Level 1 → Level 2 → Level 3 → Hint
- Follow zone structure defined in PiaJi
- Default layout: collections horizontally spaced, cards organized within each collection

## Output Format

Save to JSON file compatible with PiaJi import:
`[../templates/architecture-template.json](../templates/architecture-template.json)`

Ensure:
- Valid JSON syntax
- Unique IDs for all nodes and links
- All references (from/to/collection_id) point to existing nodes
- Positions allow for clean auto-layout
- Link labels accurately describe interaction actions from TXT

## Manual Adjustment Context

The generated architecture is meant to be manually adjusted in PiaJi, so:
- Focus on structural completeness over visual perfection
- Include all critical screens and relationships from TXT
- Provide context that helps manual adjustment
- Flag areas that may need human review

## Quality Checks

Before finalizing:
- [ ] Every collection corresponds to a major system (大系统) from TXT
- [ ] Every card corresponds to an interface (界面) from TXT
- [ ] Every card has a valid `collection_id` pointing to parent system
- [ ] All link IDs reference existing nodes
- [ ] All links follow the jump logic (界面跳转逻辑) from TXT
- [ ] All link labels describe interaction actions from TXT
- [ ] Interface levels (1/2/3) follow the TXT specification
- [ ] Collection links properly connect to main interface
- [ ] Hint cards are marked with type="hint"

## Error Handling

If TXT structure is invalid or missing required elements:
- Identify missing systems, functions, interfaces, or jump logic
- Provide clear error messages to user
- Suggest corrections to TXT structure
- Do not proceed with generation until structure is valid

## Integration with Workflow

This skill integrates with workflow step 2:
- After user reviews and edits TXT structure in step 1
- Generates architecture from user-edited TXT
- Output is rendered on canvas
- User can manually adjust architecture in PiaJi or on canvas

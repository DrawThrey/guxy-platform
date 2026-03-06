---
name: architecture-generation
description: Generate card-based interactive architecture from interactive logic records. Create collections, cards, and links following PiaJi architecture format with auto-layout support. Use when generating architecture JSON from design specs or when user mentions creating interactive architecture.
---

# Architecture Generation from Interactive Logic

## Purpose

Transform interactive logic records into editable card-based interactive architecture following the PiaJi architecture format.

## Input Requirements

Use interactive logic records from:
`[../docs/01-interactive-logic-records.md](../docs/01-interactive-logic-records.md)`

Ensure input contains:
- Functional modules with clear boundaries
- Interface hierarchy (level 1/2/3)
- Interaction flows between modules
- Information display requirements

## Architecture Structure

Follow the PiaJi architecture JSON format:

```json
{
  "collections": [
    {
      "id": "unique-id",
      "title": "主界面",
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
      "from": "card-id-1",
      "to": "card-id-2",
      "label": "Navigation description"
    }
  ],
  "collectionLinks": [
    {
      "id": "unique-id",
      "from": "collection-id-1",
      "to": "collection-id-2",
      "label": "Entry description"
    }
  ],
  "cardCollectionLinks": [
    {
      "id": "unique-id",
      "from": "card-id",
      "to": "collection-id"
    }
  ]
}
```

## Generation Rules

1. **Collections (功能集合)**
   - One collection per functional flow
   - Must include a "主界面" (Main Interface) collection
   - Set appropriate type: system, combat, story, level
   - Each collection represents a major feature area

2. **Cards (界面卡片)**
   - Screen cards: Display actual interfaces
   - Hint cards: Information display (tooltips, notifications, hints)
   - Set interface_level correctly (1 = primary, 2 = secondary, 3 = tertiary)
   - Link to appropriate collection_id

3. **Links (连线)**
   - cardLinks: Navigation between screens
   - collectionLinks: Entry points between collections
   - cardCollectionLinks: Direct links from cards to collections
   - All links must include clear labels

4. **Hierarchy Compliance**
   - Level 1 screens: Primary entry points
   - Level 2 screens: Secondary interfaces accessed from level 1
   - Level 3 screens: Detail views accessed from level 2
   - Hint cards can appear at any level

## Auto-Layout Support

Generate positions for automatic layout:
- Use `position: { x: number, y: number }` for each node
- Organize cards in collection canvas by columns: Level 1 → Level 2 → Level 3 → Info
- Follow zone structure defined in PiaJi

## Output Format

Save to JSON file compatible with PiaJi import:
`[../templates/architecture-template.json](../templates/architecture-template.json)`

Ensure:
- Valid JSON syntax
- Unique IDs for all nodes and links
- All references (from/to/collection_id) point to existing nodes
- Positions allow for clean auto-layout

## Manual Adjustment Context

The generated architecture is meant to be manually adjusted in PiaJi, so:
- Focus on structural completeness over visual perfection
- Include all critical screens and relationships
- Provide context that helps manual adjustment
- Flag areas that may need human review

## Quality Checks

Before finalizing:
- [ ] Every card has a valid collection_id
- [ ] All link IDs reference existing nodes
- [ ] At least one "主界面" collection exists
- [ ] Interface levels follow the 1→2→3 hierarchy
- [ ] Collection links properly connect to main interface
- [ ] Hint cards are marked with type="hint"

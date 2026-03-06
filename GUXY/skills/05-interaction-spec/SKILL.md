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

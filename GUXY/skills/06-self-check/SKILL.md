---
name: self-check-validation
description: Automatically validate new game features against interaction specifications and UX standards. Generate inspection reports and provide improvement suggestions. Use when checking new features, validating implementations, or when user mentions quality assurance or self-checking.
---

# UX Self-Check Validation

## Purpose

Automatically validate new game features against interaction specifications and generate actionable improvement suggestions.

## Validation Process

### Step 1: Analyze Feature Context

Read and understand:
- Feature requirements and design documents
- Generated architecture (from workflow step 2)
- Implemented code or interactive prototype
- Relevant interaction specifications

### Step 2: Check Against Interaction Specification

Verify compliance with:
`[05-interaction-spec/SKILL.md](../skills/05-interaction-spec/SKILL.md)`

Checklist:
- [ ] **Hierarchy compliance**: Interface levels (1/2/3) follow specification
- [ ] **Feedback completeness**: All user actions have clear feedback
- [ ] **Error handling**: Error states defined and recoverable
- [ ] **Touch targets**: Meet minimum size requirements (44x44px)
- [ ] **Color contrast**: Minimum 4.5:1 ratio for text
- [ ] **Terminology**: Consistent with existing game vocabulary
- [ ] **Loading states**: Visual indicators for async operations
- [ ] **Confirmation flow**: Destructive actions require confirmation
- [ ] **Animation timing**: Within 200-400ms range
- [ ] **Audio balance**: Consistent volume levels

### Step 3: User Experience Flow Analysis

Analyze the complete user journey:
- **Entry point**: Is it clear and accessible?
- **Navigation**: Can users move forward/backward easily?
- **Task completion**: Is the goal achievable?
- **Exit point**: Can users leave the flow cleanly?

Look for:
- Dead ends or confusing paths
- Unnecessary steps in the flow
- Missing information at critical decision points
- Inconsistent behavior patterns

### Step 4: Generate Inspection Report

Structure report as:

```markdown
# UX Self-Check Report

## Feature: [Feature Name]
**Date**: [YYYY-MM-DD]
**Version**: [Version Number]

## Summary
[Brief overview of validation results]

## Compliance Score
**Overall**: [X]%
- Hierarchy: [X]%
- Feedback: [X]%
- Error Handling: [X]%
- Accessibility: [X]%
- Consistency: [X]%

## Issues Found

### Critical (Must Fix)
1. **Issue Title**
   - **Location**: [Where in the flow]
   - **Problem**: [Description]
   - **Impact**: [User impact]
   - **Suggestion**: [Specific improvement]

### Important (Should Fix)
[Same structure as Critical]

### Nice to Have (Could Improve)
[Same structure as Critical]

## Passed Checks
- [Check 1]
- [Check 2]
- ...

## Recommendations
1. [Priority recommendation 1]
2. [Priority recommendation 2]
- ...

## Re-Check Required
Yes / No
```

### Step 5: Provide Improvement Suggestions

For each issue, provide:
- **Specific solution**: Concrete implementation suggestion
- **Code reference**: Where changes should be made (if applicable)
- **Priority**: Based on impact and effort
- **Examples**: Reference to existing implementation patterns

## Issue Severity Levels

**Critical**: Blocks user from completing task or causes confusion
- Missing critical feedback
- No way to recover from errors
- Inaccessible content
- Inconsistent core behavior

**Important**: Reduces usability but doesn't block
- Suboptimal navigation
- Unclear terminology
- Missing secondary feedback
- Accessibility improvements

**Nice to Have**: Polishing and optimization
- Enhanced animations
- Additional contextual help
- Minor consistency improvements
- Performance optimizations

## Scoring System

Calculate compliance score:
- **Critical issues**: -15 points each
- **Important issues**: -5 points each
- **Nice to have**: -1 point each
- Base score: 100

Example:
- 0 critical, 2 important, 3 nice to have
- Score: 100 - (2 × 5) - (3 × 1) = 87%

**Pass threshold**: 80% (may be adjusted per project)

## Re-Check Workflow

When re-checking after fixes:
1. Review previous report
2. Verify all critical issues are addressed
3. Verify all important issues are addressed (with justification if not)
4. Update compliance score
5. Generate new report with "Re-Check" flag

## Integration with Workflow

This skill integrates with workflow step 6:
- After implementation is complete
- Before final review and deployment
- Output feeds into documentation and iteration

## Documentation

Save reports to:
`[../logs/ux-self-check-[feature]-[date].md](../logs/)`

Maintain history for:
- Tracking improvements over time
- Identifying recurring issues
- Validating design decisions
- Training team members

## Context Awareness

When performing self-check:
- Understand the feature's target audience
- Consider platform-specific requirements
- Account for performance constraints
- Balance ideal UX with technical feasibility
- Learn from previous similar features

# GitHub Release Examples

## Example 1: Minor Version Release (Feature)

User says: "我想发布一个新版本，添加了新功能"

**Analysis:**
- Last tag: v1.0.0
- Commits since last tag:
  - `feat: add dark mode support`
  - `feat: add user profile page`
  - `fix: resolve login issue`

**Actions:**
1. Version bump: v1.0.0 -> v1.1.0 (minor, features added)
2. Generate CHANGELOG
3. Commit, tag, push, create release

**CHANGELOG entry:**
```markdown
## [v1.1.0] - 2026-03-06

### Features
- feat: add dark mode support
- feat: add user profile page

### Bug Fixes
- fix: resolve login issue
```

## Example 2: Patch Version Release (Bug Fixes)

User says: "修复了几个bug，需要更新版本"

**Analysis:**
- Last tag: v2.1.0
- Commits since last tag:
  - `fix: correct timezone display`
  - `fix: prevent duplicate submissions`

**Actions:**
1. Version bump: v2.1.0 -> v2.1.1 (patch, bug fixes only)
2. Generate CHANGELOG
3. Commit, tag, push, create release

**CHANGELOG entry:**
```markdown
## [v2.1.1] - 2026-03-06

### Bug Fixes
- fix: correct timezone display
- fix: prevent duplicate submissions
```

## Example 3: Major Version Release (Breaking Change)

User says: "API改了，需要发个大版本"

**Analysis:**
- Last tag: v1.5.3
- Commits since last tag:
  - `feat!: redesign API response structure`
  - `feat: add new endpoints`
  - `refactor: update database schema`

**Actions:**
1. Version bump: v1.5.3 -> v2.0.0 (major, breaking change)
2. Generate CHANGELOG
3. Commit, tag, push, create release

**CHANGELOG entry:**
```markdown
## [v2.0.0] - 2026-03-06

### Breaking Changes
- feat!: redesign API response structure

### Features
- feat: add new endpoints

### Refactoring
- refactor: update database schema
```

## Example 4: First Release (No Previous Tags)

User says: "这是第一次正式发布"

**Analysis:**
- No previous tags
- All commits analyzed

**Actions:**
1. Start with v1.0.0 (or v0.1.0 for beta)
2. Generate CHANGELOG with all features
3. Commit, tag, push, create release

## Example 5: Custom Version Bump

User says: "发个v3.0.0版本"

**Actions:**
1. User specified version: v3.0.0
2. Skip automatic version detection
3. Generate CHANGELOG
4. Commit, tag, push, create release

## GitHub Release Notes Template

```markdown
## What's Changed

### Features
- feat: description by @username in #123

### Bug Fixes
- fix: description by @username in #124

### Breaking Changes
- feat!: description

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

## Command Sequence Example

Complete workflow for v1.2.0:

```bash
# 1. Check status
git status
git log v1.1.0..HEAD --oneline

# 2. Update version
npm version minor --no-git-tag-version

# 3. Update CHANGELOG.md (manually or scripted)

# 4. Commit release
git add .
git commit -m "chore(release): v1.2.0"

# 5. Create tag
git tag -a v1.2.0 -m "Release v1.2.0"

# 6. Push
git push origin main
git push origin v1.2.0

# 7. Create GitHub release
gh release create v1.2.0 --title "v1.2.0" --notes "Release notes here"
```

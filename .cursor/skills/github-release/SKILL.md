---
name: github-release
description: Automate GitHub version releases with Conventional Commits, version bumping, CHANGELOG generation, git tags, and GitHub releases. Use when the user wants to release a new version, push version updates, create a release, or mentions versioning/changelog/tags.
---

# GitHub Release Workflow

Automates the complete version release process to GitHub.

## When to Use This Skill

Use this skill when:
- User wants to release a new version
- User mentions "push to github", "create release", "version update"
- User asks about versioning, changelog, or git tags
- User wants to bump version and publish changes

## Prerequisites Check

Before starting, verify:

1. **Git repository**: Must be initialized
2. **Remote configured**: Check with `git remote -v`
3. **Clean working directory**: Run `git status`
4. **GH CLI installed**: Check with `gh --version`

If prerequisites fail, inform user and stop.

## Complete Release Workflow

### Step 1: Analyze Commits

Run to see commits since last tag:

```bash
git describe --tags --abbrev=0 2>$null
git log <last-tag>..HEAD --oneline
```

If no tags exist, analyze all commits:

```bash
git log --oneline
```

### Step 2: Determine Version Bump

Based on Conventional Commits:

| Commit Type | Version Bump |
|-------------|--------------|
| `feat:` | MINOR (0.1.0 -> 0.2.0) |
| `fix:` | PATCH (0.1.0 -> 0.1.1) |
| `feat!:` or `BREAKING CHANGE:` | MAJOR (0.1.0 -> 1.0.0) |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:` | No bump (or PATCH if user requests) |

### Step 3: Update Version

Update version in package.json (or relevant version file):

```bash
npm version <major|minor|patch> --no-git-tag-version
```

Or manually update version file.

### Step 4: Generate CHANGELOG

Append to CHANGELOG.md:

```markdown
## [vX.Y.Z] - YYYY-MM-DD

### Features
- feat: description (#pr-number)

### Bug Fixes
- fix: description (#pr-number)

### Breaking Changes
- feat!: description (#pr-number)

### Other
- refactor/docs/style/test/chore: description
```

### Step 5: Commit Changes

```bash
git add .
git commit -m "chore(release): vX.Y.Z"
```

### Step 6: Create Git Tag

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

### Step 7: Push to GitHub

```bash
git push origin main
git push origin vX.Y.Z
```

### Step 8: Create GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file RELEASE_NOTES.md
```

Or use inline notes:

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "### Features
- feat: description

### Bug Fixes
- fix: description"
```

## Conventional Commits Reference

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting
refactor: Code refactoring
test:     Tests
chore:    Maintenance

!:        Breaking change (e.g., feat!:)
```

## Quick Commands Reference

```bash
# Check current version
git describe --tags

# List all tags
git tag -l

# Delete local tag
git tag -d vX.Y.Z

# Delete remote tag
git push origin --delete vX.Y.Z

# View recent commits
git log --oneline -10

# Check release status
gh release list
```

## Error Handling

- **Uncommitted changes**: Ask user to commit or stash first
- **No remote**: Help user configure remote origin
- **Tag exists**: Suggest incrementing version or deleting old tag
- **GH CLI not installed**: Guide user to install from https://cli.github.com/

## Workflow Checklist

Before releasing, verify:

- [ ] All changes committed
- [ ] Tests passing
- [ ] Version bumped appropriately
- [ ] CHANGELOG updated
- [ ] Git tag created
- [ ] Pushed to remote
- [ ] GitHub release created

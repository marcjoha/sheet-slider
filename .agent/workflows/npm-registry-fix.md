---
description: Fix npm registry mismatch between local corporate environment and GitHub Actions
---

## Problem
On corporate laptops, `npm install` may populate `package-lock.json` with private registry URLs (e.g., `pkg.dev`). These URLs cause **401 Unauthorized** errors in GitHub Actions because the GitHub runner doesn't have access to the private registry.

## Solutions

### 1. Fix the Lockfile for GitHub Actions
If your GitHub Actions build is failing with an E401 error, run this to reset the `package-lock.json` to use public npm URLs:

// turbo
```bash
rm package-lock.json && npm install --package-lock-only --registry=https://registry.npmjs.org
```

### 2. Local Auth Problems
If you get auth errors while running `npm` locally, follow these steps:

1. Ask the user to run `gcert` in their terminal.
2. Run the authentication helper:
// turbo
```bash
npm_config_registry=https://registry.npmjs.org npx google-artifactregistry-auth
```

### 3. Adding New Dependencies
When adding new packages, always force the public registry to keep the lockfile compatible with GitHub:

```bash
npm install <package-name> --registry=https://registry.npmjs.org
```

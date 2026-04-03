# Project Rules

## NPM Registry Management
- **Automatic Fix**: Before committing or pushing any changes that include updates to `package-lock.json`, always run the registry fix to ensure compatibility with GitHub Actions:
  ```bash
  rm package-lock.json && npm install --package-lock-only --registry=https://registry.npmjs.org
  ```
- **New Dependencies**: When installing new packages, always use the public npm registry:
  ```bash
  npm install <package-name> --registry=https://registry.npmjs.org
  ```
- **Registry Choice**: Never use internal corporate registry URLs (e.g., `pkg.dev`) in the committed `package-lock.json`, as this will cause authentication failures in CI/CD environments.

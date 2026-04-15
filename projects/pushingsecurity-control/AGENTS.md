# Monorepo Rules

- Put every deployable application in `apps/<slug>`.
- Put shared libraries, provider wrappers, schemas, and common UI in `packages/<slug>`.
- Do not create new application code at the repository root.
- When an app-specific module becomes shared by two or more apps, move it into `packages/`.
- Keep the root focused on workspace tooling, caching, and documentation.

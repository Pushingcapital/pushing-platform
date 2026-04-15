# Pushing Capital Monorepo

This repository is now the clean workspace for a growing portfolio of applications.
If we are going to host 30 applications here, the root has to stay boring:

- all deployable apps live in `apps/<app-name>`
- all shared code lives in `packages/<package-name>`
- the repository root holds workspace tooling only

## Structure

```text
pushingsecurity-control/
├── apps/
│   ├── pushing-capital-web/     # current Next.js customer + employee app
│   └── README.md
├── packages/
│   ├── ui/                      # shared UI components and design primitives
│   ├── integrations/            # provider wrappers for Google, DocuSign, Tailscale, etc.
│   ├── schemas/                 # shared contracts and validation models
│   ├── config/                  # shared tooling/configuration
│   └── README.md
├── turbo.json
├── package.json
└── .gitignore
```

## Rules

1. Never place a new application at the repository root.
2. Each application gets its own folder under `apps/`.
3. If logic is reused by two or more apps, move it into `packages/`.
4. Keep application-specific environment files inside the relevant app folder.
5. Deploy each app from its own Vercel project root, not from the monorepo root.

## Commands

```bash
npm install
npm run dev:web
npm run build
```

## Current App

The first app lives in [apps/pushing-capital-web/README.md](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/README.md).

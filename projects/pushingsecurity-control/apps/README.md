# Apps

Each deployable product, portal, or internal tool gets its own folder in `apps/`.

Current conventions:

- one application per folder
- each app owns its own `package.json`
- each app can be deployed independently on Vercel
- customer routes and employee routes should still be separated inside the app when needed

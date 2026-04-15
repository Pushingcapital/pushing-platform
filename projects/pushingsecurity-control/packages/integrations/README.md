# @pushingcap/integrations

Centralize wrappers for Google Workspace, DocuSign, Tailscale, Stripe, and similar providers here.

Current exports:

- `@pushingcap/integrations/provider-secrets`
  Shared vault/env resolution helpers and secret reader types
- `@pushingcap/integrations/docusign`
  Portable DocuSign config/status helpers plus live template list/detail access

The hosting app is expected to provide:

- a `readSecretValue({ provider, keyName })` implementation
- its own auth/route guards
- environment values for non-secret provider settings

That split keeps provider logic transferable between the current Next.js app and any future shared backend service.

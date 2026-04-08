# Stitch Site Ingest Packet

Date: 2026-04-03
Prepared by: Codex with notebook target recommended by `P`
Notebook target: `control_plane_atlas` (`e25d4029-8ec3-40c6-ae30-4abe6f892520`)

## Purpose

Capture the current Stitch public site and docs structure in a NotebookLM-friendly source so `P` can reason about:

- what Stitch is
- how the public site is structured
- which visible buttons and controls exist
- how the docs are organized
- what the MCP setup page contains
- what core Stitch capabilities are exposed through docs navigation and tool references

Primary captured surfaces:

- Home: `https://stitch.withgoogle.com/`
- Docs MCP setup: `https://stitch.withgoogle.com/docs/mcp/setup/`

Capture method:

- rendered-browser snapshot via Playwright CLI
- raw HTML shell checks for canonical URLs and app-rendered behavior

---

## High-Level Read

Stitch is presented as an AI-native UI design product for mobile and web application design. The public positioning is:

- fast UI generation
- design iteration and editing
- export to code and Figma
- Google DeepMind model-backed generation
- templates to start quickly

The docs site is not a static HTML docs tree. It is app-rendered, but the rendered browser surface clearly exposes a docs information architecture centered on:

- `Stitch`
- `MCP`
- `SDK`
- `DESIGN.md`

The most important docs page for tool integration is `Setup & Authentication` under the `MCP` section.

---

## Home Page Structure

Page title:

- `Stitch - Design with AI`

Header / top controls:

- `Product name, Stitch (beta)` logo link
- `Try now` button

Hero section:

- H1: `Design at the speed of AI`
- Supporting line: `Transform ideas into UI designs for mobile and web applications`

Hero input controls:

- main prompt text box with placeholder:
  - `What native mobile app shall we design?`
- `Choose File` button
- mode selector:
  - `App`
  - `Web`
- model control:
  - `3.0 Flash`
- live mode button:
  - `Start Live Mode (Preview)`
- primary action:
  - `Generate designs`

Template section:

- heading: `Get started with templates`
- carousel controls:
  - `Previous template`
  - `Next template`

Visible template cards:

- `SaaS Dashboard`
  - `Use template`
  - `Web Template`
- `Health App`
  - `Use template`
  - `Mobile Template`
- `Entertainment App`
  - `Use template`
  - `Mobile Template`
- `Fashion App`
  - `Use template`
  - `Mobile Template`
- `Utility App`
  - `Use template`
  - `Mobile Template`

Feature/value statements:

- `Easy edits`
  - `Iterate and tweak designs to build an interface that works best for you.`
- `Export code`
  - `Export static HTML code that matches the design and Figma export.`
- `Build with Gemini`
  - `Leverage some of the latest AI models from Google DeepMind to generate designs.`
- `Own your design`
  - `Use your original generations as you see fit. Export designs to Figma to fiddle further or copy the code to use how you'd like.`

Mid-page CTA:

- heading: `Vibe design is here`
- copy: `Stitch makes UI creation incredibly simple. No matter your background or expertise, Stitch will help you bring your ideas to life.`
- button: `Start designing`

FAQ / questions block:

- `What is Google Stitch?`
- `Is Google Stitch free of charge?`
- `Where is Stitch available?`
- `Can I export my designs to Figma?`
- `Does it generate working code?`
- `Can I create interactive multi-screen flows?`
- `What is the new MCP (Model Context Protocol) integration?`

Footer links:

- `Privacy Notice`
- `Terms & Privacy`
- `Third Party Notices`

---

## Home Page Button / Interaction Inventory

Visible or obvious interactions captured from the rendered homepage:

- `Try now`
- hero text prompt field
- `Choose File`
- app / web mode toggle
- model selector `3.0 Flash`
- `Start Live Mode (Preview)`
- `Generate designs`
- `Previous template`
- `Next template`
- each `Use template` card click target
- `Start designing`
- FAQ expanders
- footer policy links

Operational meaning:

- Stitch wants the user to either prompt a new design directly or start from a template.
- It supports both app and web flows.
- It exposes model choice and a live mode concept.
- It markets exportability and code generation directly on the homepage.

---

## Docs Site Global Chrome

Rendered docs controls on the MCP setup page:

- `Skip to content`
- `Stitch logo Stitch` link back into docs
- `Search` button
- theme selector with values:
  - `Dark`
  - `Light`
  - `Auto`
- external `X` link for Stitch on X

Docs navigation is grouped into four major sections.

### 1. Stitch

- `Everything you need to know`
- `Effective Prompting`
- `Device Types`
- `Design Modes`
- `Generate design variations`
- `Controls & Hotkeys`

### 2. MCP

- `Setup & Authentication`
- `Guide`
- `Reference`

### 3. SDK

- `Build your first design`
- `Use with AI SDK`
- `Agent-driven workflows`
- `How to edit a screen`
- `How to generate variants`
- `How to download artifacts`
- `How to extract themes`
- `Reference`
- `Architecture`

### 4. DESIGN.md

- `What is DESIGN.md?`
- `The format`
- `View, edit, and export`

This docs tree is already enough to treat Stitch as more than a one-page product. It is a documented platform with:

- product usage docs
- MCP integration docs
- SDK workflows
- design-file/spec format docs

---

## MCP Setup Page Structure

Page URL:

- `https://stitch.withgoogle.com/docs/mcp/setup/`

Prev / next nav:

- previous: `Controls & Hotkeys`
- next: `Guide`

On-page navigation anchors captured from the rendered page:

- `Overview`
- `Understanding Remote MCP`
- `API Keys vs OAuth`
- `When to use which`
- `API Key Setup`
- `Storing API Keys`
- `MCP Client Setup`

This page should be treated as the operational entrypoint for connecting Stitch to agents, MCP clients, and external tooling.

---

## Stitch Capability Surfaces Visible From Docs

The rendered MCP setup page exposed deeper reference content for actions and entities beyond authentication.

### Screen / generation actions visible

- `generate_designs`
  - creates new screens from a text prompt
  - docs visible parameters include:
    - `prompt`
    - `modelId`
  - visible model values:
    - `GEMINI_3_FLASH`
    - `GEMINI_3_1_PRO`

- `edit_screens`
  - edits existing screens using a text prompt
  - visible parameters include:
    - `projectId`
    - `selectedScreenIds`
    - `prompt`

- `generate_variants`
  - generates design variants of existing screens
  - visible parameters include:
    - `projectId`
    - `selectedScreenIds`
    - `prompt`
    - `variantOptions`

### Design system actions visible

- `create_design_system`
  - creates a new design system with foundational design tokens
  - visible parameters include:
    - `designSystem`
    - `projectId`

- `update_design_system`
  - updates an existing design system
  - visible parameters include:
    - `name`
    - `projectId`
    - `designSystem`

- `list_design_systems`
  - lists design systems for a project
  - visible parameter:
    - `projectId`

- `apply_design_system`
  - applies a design system to one or more screens
  - visible parameters include:
    - `projectId`
    - `selectedScreenInstances`
    - `assetId`

This means the docs page is already telegraphing Stitch as:

- generation engine
- screen editing engine
- variant engine
- design-system asset manager

---

## Button / Control Inventory Across Captured Surfaces

### Public homepage controls

- `Try now`
- prompt input field
- `Choose File`
- `App`
- `Web`
- `3.0 Flash`
- `Start Live Mode (Preview)`
- `Generate designs`
- `Previous template`
- `Next template`
- repeated `Use template`
- `Start designing`
- FAQ expanders

### Docs controls

- `Skip to content`
- `Search`
- `Select theme`
- `Dark`
- `Light`
- `Auto`
- section navigation expanders for:
  - `Stitch`
  - `MCP`
  - `SDK`
  - `DESIGN.md`
- sidebar doc links
- on-page anchor links
- `Previous`
- `Next`

---

## Why Stitch Matters To Pushing Capital

For Pushing Capital, Stitch is strategically relevant as:

- a design-surface generator for rapid website and UI concepting
- a docs corpus for agent-safe UI generation patterns
- an MCP and SDK integration target
- a design-system artifact source
- a bridge between prompt-based ideation and structured exports

The Stitch docs tree is especially useful for:

- building cleaner UI programs faster
- connecting agent workflows to design operations
- standardizing design systems across Pushing Capital apps
- teaching `P` how Stitch frames screens, variants, and design systems

---

## Suggested Memory Uses For P

`P` should remember:

- Stitch homepage is oriented around prompt-to-design generation
- Stitch supports app and web generation modes
- Stitch exposes templates, live mode, model choice, and export-forward messaging
- Stitch docs are grouped into `Stitch`, `MCP`, `SDK`, and `DESIGN.md`
- the key integration page is `MCP / Setup & Authentication`
- Stitch docs expose operational actions around screen generation, editing, variants, and design systems

---

## Source URLs

- `https://stitch.withgoogle.com/`
- `https://stitch.withgoogle.com/docs/mcp/setup/`

## Capture Note

The Stitch docs site is app-rendered. Raw HTTP fetches mostly expose the app shell and canonical URLs, while the meaningful information appears only after browser rendering. This packet is based on rendered Playwright snapshots, not only on raw HTML.

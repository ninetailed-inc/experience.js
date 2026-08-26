# AGENTS.md

## Repository purpose

Public pnpm/Nx monorepo containing legacy Ninetailed SDKs, plugins, utilities, playgrounds, and migration tooling.

## Working rules

- Read README.md and the nearest package or project documentation before changing behavior.
- Keep changes scoped to the component or example that owns the behavior.
- Do not commit credentials, tokens, generated secrets, or local environment files.
- Treat checked-in manifests and lockfiles as the source of truth for tooling.
- Update documentation when commands, layout, or public behavior changes.
- Preserve existing generated files and regenerate them only through their owning command.
- Run the smallest relevant validation first, then the repository-level checks.
- Call out missing credentials or external services instead of bypassing their checks.
- Keep public documentation free of private links, credentials, and non-public context.
- Record durable architectural choices under docs/ADRs/.

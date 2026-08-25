# Manage the SDK family as an Nx monorepo

- Status: Accepted
- Scope: Ninetailed Experience.js

## Context

The SDK, plugins, utilities, tests, and playgrounds evolve together and share build conventions.

## Decision

Use pnpm workspaces with Nx targets to coordinate builds, tests, linting, and caching across packages.

## Consequences

Package changes should be validated through affected Nx targets, and cross-package contracts must remain compatible.


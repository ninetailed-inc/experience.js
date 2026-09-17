# tests-generated-packages

This package contains tests that will run against generated distribution of SDKs and plugins. The goal is to prevent regressions or unexpected outcomes related, namely, to NX version upgrades and breaking changes.

Generated `package.json` snapshots preserve dependency names and sections, but normalize dependency version values. Dependency-only upgrades therefore do not require snapshot updates, while dependencies being added, removed, or moved between sections remain visible.

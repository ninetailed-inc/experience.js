# How to scan for licenses used by this repository

```sh
npx license-checker > licenses.txt

npx license-checker --summary
```

## What to do when the CI fails for check-licenses github action?

The CI is using a whitelist of licenses that are allowed to be used by this repository. If you are adding a package with a license that is not in the whitelist, you can add it to the whitelist by adding it to the github action command that is failing.

Be sure to notify the maintainer about that change.

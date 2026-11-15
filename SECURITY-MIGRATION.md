# Electron downloader security migration

Use the current @electron/get 5.1.0 download API on Node 22.22.3+, which replaces the legacy Got/cacheable-request chain. This removes http-cache-semantics rather than retaining a security backport. Remove patch-package, whose own glob dependency introduced the newly reported braces alert. Electron application behavior is unchanged. Validate with npm run test:security, unsigned packaging and actual Electron/Flask startup.

## minimatch 11 migration

All minimatch copies are overridden to 11.0.1. Override @electron/asar to
4.3.2 as well: its older default-export API and glob dependency are incompatible
with minimatch 11. Node 22.22.3+ already satisfies the newer asar requirements.

The remaining legacy consumers need a small compatibility fix, applied by
`scripts/patch-minimatch-consumers.cjs` during postinstall:

- dir-compare 4.2.0 must call the named `minimatch` export.
- glob 7.2.3, retained by the Windows installer's temp/rimraf dependencies, must
  use minimatch 11 Matcher segments' `pattern` and `test` API.

The script checks package versions and source before patching and is safe to
run again. Review/remove these fixes when upgrading those consumers. Install
with lifecycle scripts enabled so the fixes are applied. This avoids adding
patch-package and reintroducing the braces dependency removed above.

`npm run test:security` checks the locked minimatch minimum and exercises
synchronous/asynchronous recursive globbing, filelist exclusions, dir-compare
filters, and asar unpack/unpackDir behavior. Validation for this migration:
`npm ci`, `npm run test:security`, and `npx electron-builder --linux --dir`
passed on Node 24.22.1; npm reported zero vulnerabilities. macOS/Windows
installers and interactive application startup were not validated here.

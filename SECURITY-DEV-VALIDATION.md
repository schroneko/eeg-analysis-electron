# Complete development-environment validation (2026-10-25)

Current main has no open Dependabot alerts, but its managed validation procedure installs requirements-dev.txt as well as runtime requirements. That file pins setuptools83.0.0, within GHSA-xmj3-9gf7-h52w's affected range. This PR updates it compatibly to84.2.1; application and scientific calculation source are unchanged.

Fresh Python3.11.15 runtime/development installation, dependency consistency and pip-audit pass with zero vulnerabilities. Two stdlib unittests exercise actual upload, synthetic17-column EEG analysis, generated three-image Word document and attachment download. No scientific computation is mocked and no real patient data is used.

The current Node lock was independently clean-installed; the existing security test and npm audit pass. The existing Macx64 target packaged locally without signing or publication. Real GUI launch, external Python provisioning, Windows and clinical validity are not claimed.

The only repository workflow is the manually disabled managed Dependabot auto-merge workflow. A schedule/dispatch skips its verify job and can merge PRs, so it was not enabled or dispatched. These are local checks, not hosted CI success. No merge/deployment or security/billing setting change was performed.

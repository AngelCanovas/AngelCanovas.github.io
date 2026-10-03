#!/usr/bin/env bash
# Scan tracked source only; caches, dependencies and credentials are excluded.
set -euo pipefail
trap 'echo "Secret scan failed at line ${LINENO}." >&2' ERR
work="$(mktemp -d)"
trap 'rm -rf -- "$work"' EXIT
echo 'Downloading the pinned Gitleaks release.'
gh release download v8.30.1 --repo gitleaks/gitleaks \
  --pattern gitleaks_8.30.1_linux_x64.tar.gz --dir "$work"
printf '%s  %s\n' \
  '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' \
  "$work/gitleaks_8.30.1_linux_x64.tar.gz" | sha256sum --check
tar -xzf "$work/gitleaks_8.30.1_linux_x64.tar.gz" -C "$work" gitleaks
"$work/gitleaks" version
mkdir "$work/source"
git archive HEAD | tar -x -C "$work/source"
echo 'Scanning the tracked Git snapshot with secret values redacted.'
"$work/gitleaks" dir "$work/source" --no-banner --redact=100
"$work/gitleaks" git . --no-banner --redact=100 --log-opts="--all"

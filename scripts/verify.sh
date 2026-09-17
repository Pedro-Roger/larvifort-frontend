#!/usr/bin/env bash

set -u
set +e

failure=0

run_check() {
  local label="$1"
  shift
  echo "[verify] ${label}"
  "$@"
  local code=$?
  if [[ $code -ne 0 ]]; then
    echo "[verify] ${label} failed with exit code ${code}"
    failure=1
  fi
}

if [[ ! -f package.json ]]; then
  echo "[verify] package.json not found. Run this script from larvifort-crm root."
  exit 1
fi

run_check "lint" npm run lint
run_check "typecheck" npm run typecheck
run_check "build" npm run build

if [[ $failure -eq 0 ]]; then
  echo "VERIFICATION_PASS"
  exit 0
fi

echo "VERIFICATION_FAIL"
exit 1

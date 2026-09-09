#!/usr/bin/env bash

set -u
set +e
failure=0

echo "[verify] typecheck"
npx tsc --noEmit || failure=1
echo "[verify] lint"
npx eslint . || failure=1
echo "[verify] build"
npm run build || failure=1

if [[ $failure -eq 0 ]]; then
  echo "VERIFICATION_PASS"
  exit 0
fi

echo "VERIFICATION_FAIL"
exit 1

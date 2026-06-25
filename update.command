#!/bin/bash
set -e

echo "==> Fetching latest Connected update..."
cd "$(dirname "$0")"

git fetch origin
git reset --hard origin/claude/intelligent-babbage-qpqlh3

echo "==> Installing dependencies..."
npm install --silent

echo "==> Building app..."
CSC_IDENTITY_AUTO_DISCOVERY=false npm run electron:build:mac --silent

echo "==> Installing to Applications..."
APP=$(find release -name "Connected.app" -maxdepth 3 2>/dev/null | head -1)

if [ -z "$APP" ]; then
  echo "Build finished — open release/ to install manually."
else
  cp -R "$APP" /Applications/
  echo ""
  echo "✓ Connected has been updated. You can close this window."
fi

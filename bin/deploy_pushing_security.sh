#!/bin/bash
# PushingSecurity Deployment Script
# Purpose: Build and stage the pushingSecurity frontend (Epoch 0)

APP_DIR="/Users/emmanuelhaddad/pushing-platform/projects/pushingsecurity-control/apps/pushing-capital-web"
STAGING_DIR="/Users/emmanuelhaddad/pushing-platform/builds/pushing-security"

echo "🛡️ Starting PushingSecurity Lift..."

# 1. Build the Next.js application
cd "$APP_DIR" || exit
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build Successful."
    
    # 2. Stage the build artifacts
    mkdir -p "$STAGING_DIR"
    cp -r .next "$STAGING_DIR/"
    cp package.json "$STAGING_DIR/"
    
    echo "📦 Artifacts staged at $STAGING_DIR"
    
    # 3. Log the deployment status to the swarm
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] DPL.CI.CF.ALL: PushingSecurity Landing (UI 2) & Dashboard (UI 11) STAGED for deployment." >> ~/pushing-platform/logs/swarm_directives.log
    
    echo "✨ PushingSecurity Lift: STAGED."
else
    echo "❌ Build Failed. Aborting lift."
    exit 1
fi

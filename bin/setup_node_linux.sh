#!/bin/bash
# ============================================================
# P Node Setup Script — Linux (GCP VM / Ubuntu / Debian)
# Pushingcap.com Tailscale Mesh
# Run: curl -fsSL ... | bash  OR  bash setup_node_linux.sh
# ============================================================
set -e
SECRETS_SOURCE="100.88.133.52"  # Manny's Mac Studio (Tailscale IP)
NODE_NAME=$(hostname -s)
echo "🚀 Setting up P node (Linux): $NODE_NAME"

# ── 1. System packages ───────────────────────────────────────
echo "   ↳ Updating system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
  git curl wget unzip python3 python3-pip python3-venv \
  apt-transport-https ca-certificates gnupg

# ── 2. Google Cloud SDK ──────────────────────────────────────
if ! command -v gcloud &>/dev/null; then
  echo "   ↳ Installing gcloud..."
  curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] \
    https://packages.cloud.google.com/apt cloud-sdk main" | \
    sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
  sudo apt-get update -qq && sudo apt-get install -y -qq google-cloud-cli
fi

# ── 3. Node.js via nvm ───────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "   ↳ Installing Node.js..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 22 --silent
  echo 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# ── 4. Cloudflared ───────────────────────────────────────────
if ! command -v cloudflared &>/dev/null; then
  echo "   ↳ Installing cloudflared..."
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | \
    sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] \
    https://pkg.cloudflare.com/cloudflared jammy main" | \
    sudo tee /etc/apt/sources.list.d/cloudflared.list
  sudo apt-get update -qq && sudo apt-get install -y -qq cloudflared
fi

# ── 5. GitHub CLI ────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo "   ↳ Installing GitHub CLI..."
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
    sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
    https://cli.github.com/packages stable main" | \
    sudo tee /etc/apt/sources.list.d/github-cli.list
  sudo apt-get update -qq && sudo apt-get install -y -qq gh
fi

# ── 6. Node CLIs (Gemini + Wrangler) ─────────────────────────
echo "   ↳ Installing Gemini CLI + Wrangler..."
npm install -g @google/gemini-cli wrangler 2>/dev/null || true

# ── 7. Chromium for Playwright ───────────────────────────────
echo "   ↳ Installing Chromium..."
sudo apt-get install -y -qq chromium-browser 2>/dev/null || \
  sudo apt-get install -y -qq chromium 2>/dev/null || true

# ── 8. Python deps ───────────────────────────────────────────
echo "   ↳ Installing Python deps..."
pip3 install -q --break-system-packages \
  google-cloud-bigquery google-auth google-cloud-storage \
  requests playwright 2>/dev/null || \
pip3 install -q google-cloud-bigquery google-auth google-cloud-storage \
  requests playwright 2>/dev/null || true

# ── 9. Sync from Manny's Mac via Tailscale ───────────────────
echo "   ↳ Syncing from $SECRETS_SOURCE via Tailscale..."
mkdir -p ~/.config/pushingcapital ~/pushing-platform

rsync -az --progress \
  ${SECRETS_SOURCE}:~/.config/pushingcapital/secrets.env \
  ~/.config/pushingcapital/secrets.env 2>/dev/null || \
  echo "   ⚠️  Manual: scp ${SECRETS_SOURCE}:~/.config/pushingcapital/secrets.env ~/.config/pushingcapital/"

rsync -az --exclude='node_modules' --exclude='.next' --exclude='.venv' \
  --exclude='.antigravity' --progress \
  ${SECRETS_SOURCE}:~/pushing-platform/ ~/pushing-platform/ 2>/dev/null || \
  echo "   ⚠️  Manual rsync needed"

# ── 10. GitHub auth via token ─────────────────────────────────
echo "   ↳ Setting up GitHub auth..."
if [ -f ~/.config/pushingcapital/secrets.env ]; then
  GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" ~/.config/pushingcapital/secrets.env | cut -d= -f2-)
  if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | gh auth login --with-token 2>/dev/null
    echo "   ✅ GitHub: $(gh auth status 2>&1 | grep 'Logged in' | head -1)"
  fi
fi

# ── 11. GCP SA auth ──────────────────────────────────────────
echo "   ↳ Setting up GCP auth..."
if [ -f ~/.config/pushingcapital/secrets.env ]; then
  SA_KEY=$(grep "^GCP_SERVICE_ACCOUNT_KEY=" ~/.config/pushingcapital/secrets.env | cut -d= -f2-)
  if [ -n "$SA_KEY" ] && [ ${#SA_KEY} -gt 100 ]; then
    echo "$SA_KEY" > /tmp/p_sa_key.json
    gcloud auth activate-service-account \
      --key-file=/tmp/p_sa_key.json \
      --project=brain-481809 2>/dev/null
    gcloud config set project brain-481809 2>/dev/null
    rm -f /tmp/p_sa_key.json
    echo "   ✅ GCP auth activated"
  fi
fi

# ── 12. Python venv for P ─────────────────────────────────────
echo "   ↳ Building P venv..."
cd ~/pushing-platform
python3 -m venv .venv_swarm
.venv_swarm/bin/pip install -q google-cloud-bigquery google-auth \
  google-cloud-storage requests 2>/dev/null || true

# ── 13. Systemd service for P relay ───────────────────────────
echo "   ↳ Installing P relay systemd service..."
sudo tee /etc/systemd/system/p-relay.service > /dev/null << SVCEOF
[Unit]
Description=P Web Relay (Pushing Capital)
After=network.target tailscaled.service
Wants=tailscaled.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/pushing-platform
ExecStart=$HOME/pushing-platform/.venv_swarm/bin/python3 $HOME/pushing-platform/bin/p_web_relay.py --port 7779
Restart=always
RestartSec=5
Environment=HOME=$HOME
EnvironmentFile=$HOME/.config/pushingcapital/secrets.env

[Install]
WantedBy=multi-user.target
SVCEOF

sudo systemctl daemon-reload
sudo systemctl enable p-relay
sudo systemctl start p-relay
echo "   ✅ p-relay service started"

echo ""
echo "✅ Linux node setup complete: $NODE_NAME"
echo "   Tailscale IP: $(tailscale ip -4 2>/dev/null || echo 'run: sudo tailscale up')"
echo "   GitHub:       $(gh api user --jq .login 2>/dev/null || echo 'check token')"
echo "   GCloud:       $(gcloud config get-value account 2>/dev/null || echo 'check SA key')"
echo "   P relay:      $(systemctl is-active p-relay 2>/dev/null)"
echo ""
echo "Next: start the Tailscale tunnel"
echo "  cloudflared tunnel --url http://localhost:7779"

#!/bin/bash
# ============================================================
# P Node Setup Script — macOS
# Pushingcap.com Tailscale Mesh
# Run: bash setup_node_mac.sh
# ============================================================
set -e
SECRETS_SOURCE="100.88.133.52"  # Manny's Mac Studio (Tailscale IP)
NODE_NAME=$(hostname -s)
echo "🚀 Setting up P node: $NODE_NAME"

# ── 1. Homebrew ──────────────────────────────────────────────
if ! command -v brew &>/dev/null; then
  echo "   ↳ Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"

# ── 2. Core CLIs ────────────────────────────────────────────
echo "   ↳ Installing CLIs..."
brew install --quiet gh git python3 node 2>/dev/null || true

# ── 3. Google Cloud SDK ──────────────────────────────────────
if ! command -v gcloud &>/dev/null; then
  echo "   ↳ Installing gcloud..."
  brew install --cask --quiet google-cloud-sdk 2>/dev/null || true
fi

# ── 4. Cloudflare Tools ──────────────────────────────────────
if ! command -v cloudflared &>/dev/null; then
  brew install --quiet cloudflared 2>/dev/null || true
fi
if ! command -v wrangler &>/dev/null; then
  npm install -g wrangler 2>/dev/null || true
fi

# ── 5. Node / Gemini CLI ────────────────────────────────────
if ! command -v nvm &>/dev/null; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 22 --silent
fi
npm install -g @google/gemini-cli 2>/dev/null || true

# ── 6. Python dependencies ───────────────────────────────────
echo "   ↳ Installing Python deps..."
pip3 install -q google-cloud-bigquery google-auth google-cloud-storage \
               requests playwright 2>/dev/null || true

# ── 7. Sync secrets + P stack from Manny's Mac ───────────────
echo "   ↳ Syncing secrets from $SECRETS_SOURCE..."
mkdir -p ~/.config/pushingcapital
rsync -az --progress \
  ${SECRETS_SOURCE}:~/.config/pushingcapital/secrets.env \
  ~/.config/pushingcapital/secrets.env 2>/dev/null || \
  echo "   ⚠️  Manual copy needed: scp ${SECRETS_SOURCE}:~/.config/pushingcapital/secrets.env ~/.config/pushingcapital/"

echo "   ↳ Syncing P stack from $SECRETS_SOURCE..."
mkdir -p ~/pushing-platform
rsync -az --exclude='node_modules' --exclude='.next' --exclude='.venv' --progress \
  ${SECRETS_SOURCE}:~/pushing-platform/ \
  ~/pushing-platform/ 2>/dev/null || echo "   ⚠️  Manual sync needed"

# ── 8. GitHub CLI auth via stored token ──────────────────────
echo "   ↳ Setting up GitHub auth..."
if [ -f ~/.config/pushingcapital/secrets.env ]; then
  GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" ~/.config/pushingcapital/secrets.env | cut -d= -f2-)
  if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | gh auth login --with-token 2>/dev/null
    echo "   ✅ GitHub: $(gh auth status 2>&1 | head -1)"
  fi
fi

# ── 9. gcloud auth via SA key ────────────────────────────────
echo "   ↳ Setting up GCP auth..."
if [ -f ~/.config/pushingcapital/secrets.env ]; then
  SA_KEY=$(grep "^GCP_SERVICE_ACCOUNT_KEY=" ~/.config/pushingcapital/secrets.env | cut -d= -f2-)
  if [ -n "$SA_KEY" ] && [ ${#SA_KEY} -gt 100 ]; then
    echo "$SA_KEY" > /tmp/p_sa_key.json
    gcloud auth activate-service-account --key-file=/tmp/p_sa_key.json --project=brain-481809 2>/dev/null
    rm -f /tmp/p_sa_key.json
    echo "   ✅ GCP: activated SA p-pcrm-cloudsdk@brain-481809.iam.gserviceaccount.com"
  fi
fi

# ── 10. Create Python venv for P ───────────────────────────
echo "   ↳ Setting up Python venv..."
cd ~/pushing-platform
python3 -m venv .venv_swarm
.venv_swarm/bin/pip install -q google-cloud-bigquery google-auth \
  google-cloud-storage requests playwright 2>/dev/null || true

echo ""
echo "✅ Node setup complete: $NODE_NAME"
echo "   Tailscale: $(tailscale ip -4 2>/dev/null || echo 'not running')"
echo "   GitHub:    $(gh api user --jq .login 2>/dev/null || echo 'check token')"
echo "   GCloud:    $(gcloud config get-value account 2>/dev/null || echo 'check SA key')"
echo ""
echo "To run P relay on this node:"
echo "  ~/pushing-platform/.venv_swarm/bin/python3 ~/pushing-platform/bin/p_web_relay.py --port 7779 &"

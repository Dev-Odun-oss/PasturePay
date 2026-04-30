#!/usr/bin/env bash
# scripts/deploy.sh — Build and deploy LumiFund to Stellar Testnet
set -euo pipefail

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
CONTRACT_DIR="$(dirname "$0")/../contract"

echo "==> Building contract (wasm)…"
cd "$CONTRACT_DIR"
cargo build --target wasm32-unknown-unknown --release
WASM="target/wasm32-unknown-unknown/release/lumifund.wasm"

echo "==> Optimising wasm…"
stellar contract optimize --wasm "$WASM"
OPT_WASM="${WASM%.wasm}.optimized.wasm"

echo "==> Deploying to $NETWORK…"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$OPT_WASM" \
  --source "$DEPLOYER_SECRET" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo ""
echo "✅  Contract deployed!"
echo "   CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "Add to your .env files:"
echo "  NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
echo "  LUMIFUND_CONTRACT_ID=$CONTRACT_ID"

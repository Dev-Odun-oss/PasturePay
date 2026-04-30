#!/usr/bin/env bash
# scripts/setup-testnet.sh — Fund a new keypair and create a test USDC-like token
set -euo pipefail

RPC_URL="https://soroban-testnet.stellar.org"
FRIENDBOT="https://friendbot.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "==> Generating deployer keypair…"
KEYPAIR=$(stellar keys generate deployer --network testnet 2>&1)
SECRET=$(stellar keys show deployer --secret 2>/dev/null)
PUBLIC=$(stellar keys show deployer 2>/dev/null)

echo "   Public:  $PUBLIC"
echo "   Secret:  $SECRET"

echo "==> Funding via Friendbot…"
curl -s "$FRIENDBOT?addr=$PUBLIC" | jq .result

echo ""
echo "Export before running deploy.sh:"
echo "  export DEPLOYER_SECRET=$SECRET"

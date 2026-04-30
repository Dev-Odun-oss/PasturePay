# LumiFund

Milestone-based crowdfunding protocol on Stellar Soroban.

Backers contribute tokens to a campaign. Funds are locked in the contract and released milestone-by-milestone only when backers vote to approve each one. If a campaign fails, contributors can claim a full refund.

---

## Architecture

```
Next.js 14 (frontend)
    │  Freighter wallet + Soroban RPC
    ▼
NestJS API (backend)
    │  Prisma + PostgreSQL
    │  Horizon event indexer (polls every 10 s)
    ▼
Soroban Smart Contract (Rust)
    │
    ▼
Stellar Testnet / Mainnet
```

---

## Smart Contract

**Location:** `contract/src/lib.rs`

| Function | Description |
|---|---|
| `create_campaign(creator, goal, token, milestones[])` | Creates a new campaign, returns `campaign_id` |
| `contribute(campaign_id, contributor, amount)` | Transfers tokens into contract, returns `contribution_id` |
| `vote_milestone(campaign_id, milestone_index, voter, approve)` | Casts a backer vote on a milestone |
| `release_funds(campaign_id, milestone_index)` | Creator claims milestone funds after majority approval |
| `refund(campaign_id, contribution_id)` | Contributor reclaims tokens from a failed campaign |
| `fail_campaign(campaign_id, admin)` | Marks campaign as failed (admin / deadline enforcement) |

**Events emitted:** `campaign_created`, `contributed`, `milestone_voted`, `funds_released`, `refunded`, `campaign_failed`

### Build & Test

```bash
cd contract
cargo test
cargo build --target wasm32-unknown-unknown --release
```

---

## Backend (NestJS)

**Location:** `backend/`

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/campaigns` | Create campaign record |
| `GET` | `/campaigns` | List all campaigns |
| `GET` | `/campaigns/:id` | Get campaign with milestones & contributions |

The `HorizonService` polls Stellar Horizon every 10 seconds and syncs on-chain events (`contributed`, `campaign_failed`) into PostgreSQL.

### Setup

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, LUMIFUND_CONTRACT_ID, HORIZON_URL
npm install
npx prisma migrate dev --name init
npm run start:dev
```

### Tests

```bash
npm run test:e2e
```

---

## Frontend (Next.js 14)

**Location:** `frontend/`

| Route | Description |
|---|---|
| `/` | Landing page |
| `/campaigns` | Browse all campaigns with progress bars |
| `/campaigns/new` | 2-step campaign creation wizard |
| `/campaigns/[id]` | Campaign detail, milestone tracker, contribute panel |
| `/backer` | Wallet-connected portal showing contributions + refund button |

### Setup

```bash
cd frontend
cp .env.example .env.local   # fill in NEXT_PUBLIC_* vars
npm install
npm run dev
```

---

## Deploy to Testnet

### 1. Fund a keypair

```bash
bash scripts/setup-testnet.sh
export DEPLOYER_SECRET=<secret from above>
```

### 2. Deploy contract

```bash
bash scripts/deploy.sh
```

Copy the printed `CONTRACT_ID` into both `.env` files.

### 3. Start services

```bash
# Terminal 1 — backend
cd backend && npm run start:dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

---

## Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/lumifund
LUMIFUND_CONTRACT_ID=C...
HORIZON_URL=https://horizon-testnet.stellar.org
PORT=3001
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=C...
```

---

## Project Structure

```
lumifund/
├── contract/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs          # contract logic
│       └── test.rs         # 6 unit tests
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── campaign/       # CRUD API
│   │   ├── horizon/        # Horizon indexer
│   │   └── prisma/         # DB service
│   └── test/campaign.e2e-spec.ts
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # home
│       │   ├── campaigns/page.tsx  # list
│       │   ├── campaigns/new/      # wizard
│       │   ├── campaigns/[id]/     # detail
│       │   └── backer/page.tsx     # portal
│       ├── components/
│       │   ├── ContributePanel.tsx
│       │   └── MilestoneTracker.tsx
│       └── lib/
│           ├── stellar.ts  # Freighter + Soroban calls
│           └── api.ts      # backend REST calls
└── scripts/
    ├── deploy.sh
    └── setup-testnet.sh
```

---

## License

MIT

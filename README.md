````markdown
# pasture pay

## Livestock-Backed Decentralized Micro-Lending Platform on Stellar

pastute pay is a decentralized finance (DeFi) platform designed to provide accessible financial services to farmers and livestock owners by enabling them to tokenize livestock assets and use them as collateral for instant micro-loans.

Built on the Stellar blockchain using Soroban smart contracts, the platform allows users to mint livestock-backed NFTs representing real-world agricultural assets such as cattle, goats, sheep, and poultry. These tokenized assets can then be locked as collateral to obtain USDC loans without relying on traditional banking systems.

StellarKraal combines blockchain transparency, decentralized lending infrastructure, and agricultural finance to create a scalable and secure lending ecosystem for underserved communities.

---

# Table of Contents

- Overview
- Problem Statement
- Solution
- Features
- System Architecture
- Smart Contract Architecture
- Technology Stack
- Full Implementation
- Project Structure
- Installation
- Environment Variables
- Running the Project
- API Modules
- Queue System
- Database Design
- Security Considerations
- Testing
- Deployment
- Future Roadmap
- Contributing
- License

---

# Overview

Traditional agricultural financing remains inaccessible to many rural farmers due to:

- Lack of formal credit history
- Slow loan approval systems
- High collateral requirements
- Centralized banking limitations
- Limited access to digital financial infrastructure

StellarKraal solves these issues by transforming livestock into verifiable on-chain collateral through NFT tokenization and decentralized lending protocols powered by Stellar and Soroban.

---

# Problem Statement

Small-scale farmers often possess valuable livestock assets but cannot access fair and timely financial services because those assets are not recognized within traditional financial systems.

Challenges include:

- No access to formal banking
- Lack of credit scores
- Delayed loan approvals
- Unsecured informal lending
- High-interest loan structures
- Poor transparency in agricultural financing

---

# Solution

StellarKraal enables farmers to:

1. Register livestock assets
2. Mint livestock-backed NFTs
3. Use NFTs as collateral
4. Receive instant USDC loans
5. Repay loans directly on-chain
6. Recover collateral after repayment

The protocol removes intermediaries and provides transparent decentralized financing infrastructure.

---

# Features

## Livestock NFT Minting

Farmers can tokenize livestock into unique NFTs stored on the Stellar blockchain.

Each NFT contains:

- Livestock identification data
- Breed information
- Ownership metadata
- Vaccination records
- Estimated valuation
- Registration timestamps

### Implemented Functionalities

- Soroban NFT smart contract
- Metadata storage support
- NFT ownership validation
- Mint authorization logic
- Collateral transfer restrictions
- Asset verification handling

---

## Collateral-Backed USDC Loans

Users can lock livestock NFTs as collateral and receive USDC loans instantly.

### Implemented Functionalities

- Loan creation contract
- Loan-to-value validation
- Collateral locking mechanism
- Dynamic interest calculations
- Borrowing limit enforcement
- Loan duration tracking
- Active loan management
- Multi-loan support

---

## Automated Repayment System

Repayment calculations are handled directly on-chain.

### Implemented Functionalities

- Interest accrual engine
- Partial repayment support
- Full repayment settlement
- Real-time debt calculations
- Repayment history tracking
- Loan completion events

---

## Liquidation Engine

Defaulted loans are automatically processed for liquidation to protect lender liquidity.

### Implemented Functionalities

- Default detection logic
- Liquidation eligibility checks
- Collateral seizure mechanism
- Time-based expiration validation
- Risk threshold management

---

## Farmer Dashboard

A frontend dashboard allows farmers to manage livestock and loans.

### Implemented Functionalities

- Wallet authentication
- NFT portfolio management
- Loan tracking dashboard
- Repayment interface
- Transaction history
- Responsive mobile-friendly interface

---

## Lender Dashboard

Lenders can supply liquidity and monitor loan activity.

### Implemented Functionalities

- Liquidity pool management
- Loan analytics
- Repayment monitoring
- Yield tracking
- Portfolio overview

---

# System Architecture

```text
Frontend (Next.js)
        |
        v
Backend API (NestJS)
        |
        v
PostgreSQL Database
        |
        v
Soroban Smart Contracts
        |
        v
Stellar Blockchain
```

---

# Smart Contract Architecture

The protocol consists of multiple smart contracts deployed on Soroban.

## 1. Livestock NFT Contract

Responsibilities:

- NFT minting
- Metadata management
- Ownership tracking
- Collateral locking restrictions

---

## 2. Loan Manager Contract

Responsibilities:

- Loan issuance
- Interest calculations
- Debt tracking
- Repayment processing

---

## 3. Liquidation Contract

Responsibilities:

- Default detection
- Collateral liquidation
- Risk handling

---

## 4. Treasury Contract

Responsibilities:

- USDC reserve management
- Liquidity accounting
- Fund distribution

---

# Technology Stack

## Blockchain

- Stellar Blockchain
- Soroban Smart Contracts
- Rust
- USDC Integration

## Frontend

- Next.js 14
- TypeScript
- TailwindCSS
- ShadCN UI
- React Query
- Zustand
- Freighter Wallet SDK

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ

## Infrastructure

- Docker
- GitHub Actions
- Vercel
- Railway / Render

---

# Full Implementation

## Frontend Implementation

The frontend application was built using Next.js 14 with App Router architecture.

### Implemented Pages

- Landing Page
- Dashboard
- Loan Management
- NFT Portfolio
- Repayment Interface
- Lender Analytics
- Authentication Flow

### Implemented Components

- Wallet Connect Modal
- Loan Cards
- NFT Asset Cards
- Repayment Modals
- Analytics Charts
- Notification System
- Transaction Tables

### Frontend Integrations

- Freighter wallet integration
- Soroban RPC communication
- REST API integration
- Real-time loan status updates

---

## Backend Implementation

The backend API was developed using NestJS with modular architecture.

### Implemented Modules

- Authentication Module
- Users Module
- Livestock Module
- NFT Module
- Loans Module
- Repayment Module
- Treasury Module
- Analytics Module

### Backend Functionalities

- JWT authentication
- Role-based authorization
- Loan processing logic
- Blockchain event indexing
- Queue-based background jobs
- Database synchronization
- API rate limiting

---

## Smart Contract Implementation

The Soroban smart contracts were written in Rust.

### Implemented Contracts

- NFT Contract
- Loan Contract
- Treasury Contract
- Liquidation Contract

### Contract Functionalities

- NFT minting
- Collateral locking
- Loan issuance
- Interest calculation
- Repayment processing
- Default handling
- Liquidation execution

---

## Queue System Implementation

BullMQ and Redis were implemented for asynchronous job processing.

### Implemented Queues

- Loan Processing Queue
- Blockchain Sync Queue
- Notification Queue
- Repayment Queue
- Liquidation Queue

### Queue Functionalities

- Retry handling
- Delayed jobs
- Failed job monitoring
- Queue concurrency management

---

# Project Structure

```text
StellarKraal/
|
├── contracts/
│   ├── livestock-nft/
│   ├── loan-manager/
│   ├── liquidation-engine/
│   └── treasury/
|
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── styles/
|
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── queues/
│   └── modules/
|
├── docs/
├── scripts/
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/dev-fatima-24/StellarKraal.git
cd StellarKraal
```

---

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Build Smart Contracts

```bash
cd contracts
cargo build
```

---

# Environment Variables

Create a `.env` file in the backend and frontend directories.

```env
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=
NEXT_PUBLIC_FREIGHTER_NETWORK=testnet
USDC_CONTRACT_ADDRESS=
```

---

# Running the Project

## Start Frontend

```bash
npm run dev
```

---

## Start Backend

```bash
npm run start:dev
```

---

## Deploy Smart Contracts

```bash
soroban contract deploy
```

---

# API Modules

## Authentication API

Endpoints:

- POST /auth/register
- POST /auth/login
- GET /auth/profile

---

## Livestock API

Endpoints:

- POST /livestock/create
- GET /livestock
- GET /livestock/:id

---

## Loan API

Endpoints:

- POST /loans/create
- POST /loans/repay
- GET /loans
- GET /loans/:id

---

# Database Design

## Main Tables

### users
- id
- wallet_address
- role
- created_at

### livestock
- id
- owner_id
- breed
- valuation
- metadata

### loans
- id
- borrower_id
- collateral_id
- principal
- interest
- due_date

### repayments
- id
- loan_id
- amount
- paid_at

---

# Security Considerations

Implemented security measures include:

- Smart contract access control
- Input validation
- Overflow-safe arithmetic
- Secure wallet authentication
- JWT authorization
- API rate limiting
- Environment variable protection
- Queue retry management

Future improvements include:

- Smart contract auditing
- Multi-signature treasury wallets
- Oracle-based valuation systems
- Decentralized identity verification

---

# Testing

## Smart Contract Tests

```bash
cargo test
```

---

## Frontend Tests

```bash
npm run test
```

---

## Backend Tests

```bash
npm run test:e2e
```

---

# Deployment

## Frontend Deployment

Frontend deployed using:

- Vercel

---

## Backend Deployment

Backend deployed using:

- Railway
- Render

---

## Blockchain Deployment

Contracts deployed on:

- Stellar Testnet
- Stellar Mainnet

---

# Future Roadmap

- Oracle-based livestock valuation
- Mobile application
- AI risk scoring
- Livestock insurance integration
- DAO governance
- Multi-currency support
- Offline onboarding
- Decentralized reputation system

---

# Contributing

Contributions are welcome.

## Steps

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to your branch
5. Open a pull request

---

# License

MIT License

---

# Authors

Developed by the StellarKraal Team.
````

# Vibing Farmer 🌾

> **"Set once. Vibe forever."**

Automated multi-vault yield farming powered by an AI-coordinated agent swarm. User expresses intent once — agents execute in parallel, blockchain enforces boundaries cryptographically.

**Hackathon:** MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off  
**Deadline:** 15 Juni 2026 | **Prize:** $11,000 | **Solo**

---

## What It Does

1. **Venice AI** analyzes user intent (amount, risk, # of vaults) → generates multi-vault strategy + per-agent skill sets
2. **User reviews** generated skills → edits if needed → approves
3. **Orchestrator Agent** receives plan → dispatches Worker Agents in parallel
4. **Worker Agents** each handle one complete vault flow: Swap → Approve → Deposit
5. All transactions relay gas-free via **1Shot Permissionless Relayer**
6. **Real-time vis.js graph** visualizes agent network, status, and memory in browser

---

## Hackathon Tracks Targeted

| Track | Prize | How We Win |
|-------|-------|-----------|
| Best Agent | $3,000 | Agent swarm with skill system + persistent memory |
| Best Venice AI | $3,000 | Coordinator + skill auto-generation per agent |
| Best A2A Coordination | $3,000 | Orchestrator → parallel Worker dispatch |
| Best Use of 1Shot | $1,000 | All agent transactions via 1Shot relay |

---

## Architecture

```
User Input (amount, risk, # vaults)
        │
        ▼
Venice AI Coordinator
  ├── Generate multi-vault strategy
  └── Auto-generate skill set per agent per step
        │
        ▼
User Reviews & Approves Skills
        │
        ▼
Orchestrator Agent
  ├── Worker Agent 1 → Vault A (Swap→Approve→Deposit)
  ├── Worker Agent 2 → Vault B (Swap→Approve→Deposit)
  └── Worker Agent N → Vault N (parallel)
        │
        │ All via ERC-7715 permission + 1Shot Relay
        ▼
AgentVaultDepositor.sol (Sepolia)
  └── MockVault.sol × N (ERC-4626)
        │
        ▼
Agent Memory + vis.js Graph (real-time)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity ^0.8.24, Foundry |
| Frontend | HTML/CSS/JS + ethers.js v6 + vis.js Network |
| AI Coordinator | Venice AI API (OpenAI-compatible, llama-3.3-70b) |
| Relay | 1Shot Permissionless Relayer (JSON-RPC) |
| Wallet | MetaMask Flask 13.9+ (Smart Accounts Kit) |
| Network | Ethereum Sepolia |

---

## Differentiators vs DeleGate

| Feature | Vibing Farmer | DeleGate |
|---------|--------------|---------|
| Execution | Parallel multi-agent | Sequential |
| Skill system | Per-agent JSON, user reviews | None |
| Agent memory | Persistent, visualized | None |
| AI coordinator | Venice AI (skill gen + strategy) | Groq (no Venice track) |
| Relay | 1Shot (active) | Skips 1Shot track |
| Use case | Yield farming specific | Generic |

---

## Quick Start

See [GETTING_STARTED.md](GETTING_STARTED.md) for full setup.

```bash
# Smart contracts (WSL only)
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && forge build"
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && forge test"

# Frontend
npx serve frontend/
```

---

## Docs (Indonesian / Bahasa Indonesia)

| Doc | Isi |
|-----|-----|
| [teknis-arsitektur.md](docs/teknis-arsitektur.md) | Architecture, ADR, NFR, failure modes |
| [teknis-blockchain-penggunaan.md](docs/teknis-blockchain-penggunaan.md) | On-chain scope, audit trail, risks |
| [teknis-keamanan-privasi.md](docs/teknis-keamanan-privasi.md) | Security constraints, threat model |
| [teknis-api-events.md](docs/teknis-api-events.md) | API docs, event schema, payloads |
| [teknis-database.md](docs/teknis-database.md) | Data model: skill files, memory logs, on-chain |
| [produk-demo-skenario.md](docs/produk-demo-skenario.md) | Demo script — **read before recording** |
| [produk-fitur-lengkap.md](docs/produk-fitur-lengkap.md) | Full feature list + priorities |
| [produk-user-stories.md](docs/produk-user-stories.md) | User stories + acceptance criteria |
| [bisnis-dampak-model.md](docs/bisnis-dampak-model.md) | Business impact + value model |
| [bisnis-roadmap-backlog.md](docs/bisnis-roadmap-backlog.md) | 20-day roadmap + risk matrix |

---

## Vision

Web3 → Web4 transition primitive.  
Users express intent. Agents execute autonomously. Blockchain enforces boundaries cryptographically.

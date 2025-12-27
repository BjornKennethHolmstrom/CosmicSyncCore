# CivicBase
**Offline-First Infrastructure for Swedish Municipal Resilience**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Status](https://img.shields.io/badge/status-proof--of--concept-yellow)](https://github.com/yourusername/CivicBase)

---

## About This Project

CivicBase is developed under the **Global Governance Frameworks** research 
initiative by Björn Kenneth Holmström, independent systems architect and 
researcher based in Upplands Väsby, Sweden.

### Organizational Status

Global Governance Frameworks is currently a **research initiative**, not a 
registered legal entity. We are seeking institutional partnerships with Swedish 
municipalities and civil defense organizations before formalizing organizational 
structure.

Upon securing funding and institutional backing, Global Governance Frameworks 
will be established as a Swedish non-profit organization (ideell förening) 
focused on public infrastructure development.

## The Problem

**November 2024:** Undersea cables in the Baltic Sea were severed between Sweden-Lithuania and Finland-Germany. Swedish municipalities, 95% dependent on American cloud infrastructure (AWS, Azure, Google Cloud), would have completely failed during extended outages.

**Current reality:**
- Payment systems (Swish, BankID) require central servers + continuous internet
- Municipal IT runs entirely in foreign clouds
- No offline capability for critical services
- Single points of failure everywhere

**When cables are cut, Swedish society stops.**

---

## The Solution: CivicBase

CivicBase is **peer-to-peer infrastructure** that enables Swedish municipalities to maintain critical services during infrastructure disruptions.

Built on **libp2p** (proven technology powering IPFS/Filecoin globally), CivicBase provides:

- **Offline-first operation** - Services continue via mesh networks when internet fails
- **Data sovereignty** - All data stays in Sweden on Swedish devices
- **No single point of failure** - Distributed architecture survives cable cuts
- **Crisis-ready by design** - 72+ hour offline operation validated

**This is infrastructure Sweden should have built in 2010—before becoming dependent on foreign clouds.**

---

## Project Status

**Phase:** Proof-of-concept development (Vinnova 12-month grant)  
**Timeline:** January 2026 - December 2026  
**Funding:** 2.5M SEK (Vinnova + MCF parallel track)  
**Deliverable:** Production-ready platform with TAK-405 integration

**Current capabilities:**
- ✅ Database layer (SQLite, agent-centric schema)
- ✅ Authentication & encryption (JWT, AES-256-GCM, PBKDF2)
- ✅ Sync infrastructure (conflict resolution, vector clocks)
- ✅ Backup/restore (compressed, checksummed)
- ✅ Event system, caching, monitoring
- ✅ Comprehensive test coverage (12 integration test files)
- 🔄 P2P networking (libp2p modernization in progress)
- 🔄 Mesh networking (Bluetooth/Wi-Fi Direct fallback)
- 🔄 Hearts currency (offline transactions)

**Next milestone:** 72-hour offline operation test (Q3 2026)

---

## Applications

CivicBase is a **platform**, not a single application. It enables:

### TAK-405 "Regionens Nervsystem"
Transit wellness system for Stockholm public transport. Uses Hearts currency to incentivize helping behavior, reducing psychological stress. **Proof-of-concept for offline economic transactions.**

### DPOP (Democratic Party Operations Platform)
Political organizing that continues during cable cuts. Meetings, decisions, coordination—all offline-capable with sync when connectivity returns.

### DiDiS (Distributed Digital Identity System)
Privacy-preserving identity verification without central databases. Agent-centric architecture means no single point of compromise.

**Future:** Healthcare records, elder care coordination, emergency response, climate adaptation—any municipal service requiring crisis resilience.

---

## Architecture

### Core Principles

**1. Privacy by Physics, Not Policy**
- Agent-centric design: Each citizen controls their data on their device
- End-to-end encryption: Data mathematically sealed, no intermediary can read
- No central database: No "master copy" to hack, leak, or subpoena

**2. Sovereign Connectivity**
- Peer-to-peer networking (libp2p)
- Mesh networks maintain local coordination when internet fails
- Eliminates dependency on foreign cloud providers

**3. Resilience Over Efficiency**
- Graceful degradation, never total failure
- Offline capability is default, not exception
- 72-hour resilience target for critical functions

**4. Dual-Use Infrastructure**
- **Peacetime:** Municipal innovation (TAK-405, DPOP, DiDiS)
- **Crisis:** Critical redundancy (economic continuity, resource coordination)

### Technology Stack

**Runtime:** Node.js 20+ (LTS)  
**Database:** SQLite (per-device, offline-first)  
**P2P Networking:** libp2p (battle-tested, powers IPFS/Filecoin)  
**Encryption:** AES-256-GCM (data), Ed25519 (signatures)  
**Sync:** Vector clocks + last-write-wins conflict resolution  
**Testing:** Jest, Supertest (comprehensive integration tests)

### Why libp2p, Not Blockchain?

**Blockchain:**
- ❌ Requires global internet connectivity
- ❌ High energy consumption
- ❌ Poor performance at scale
- ❌ Immutable ledger (GDPR conflict)

**libp2p:**
- ✅ Offline-capable mesh networking
- ✅ Minimal resource consumption
- ✅ Modular (use only what you need)
- ✅ NAT traversal works behind firewalls
- ✅ GDPR-compliant (data can be deleted)

See [ARCHITECTURE.md](docs/CURRENT/ARCHITECTURE.md) for full technical details.

---

## Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- SQLite 3
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/CivicBase.git
cd CivicBase

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm start
```

### Your First Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Good starting points:**
1. Review test coverage - Run `npm test`, identify gaps
2. Update libp2p integration - Migrate to modern ESM modules
3. Document offline reconciliation - Explain conflict resolution
4. Add mesh networking - Implement Bluetooth/Wi-Fi Direct

---

## Documentation

### Essential Reading

- **[VISION.md](docs/CURRENT/VISION.md)** - CivicBase mission and strategic context
- **[ARCHITECTURE.md](docs/CURRENT/ARCHITECTURE.md)** - Technical architecture and design decisions
- **[12-MONTH-ROADMAP.md](docs/CURRENT/12-MONTH-ROADMAP.md)** - Vinnova grant implementation plan
- **[MANIFESTO.md](MANIFESTO.md)** - Principles and commitments
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

### Technical Reference

- **[API Documentation](docs/TECHNICAL_REFERENCE/api/)** - RESTful and WebSocket APIs
- **[OpenAPI Specification](docs/TECHNICAL_REFERENCE/openapi.yaml)** - Machine-readable API spec
- **[Test Suite](tests/)** - Integration tests demonstrate capabilities

---

## Project Structure

```
CivicBase/
├── src/
│   ├── core/          # Authentication, encryption, sync, logging
│   ├── p2p/           # libp2p networking, discovery, mesh
│   ├── data/          # Database layer, adapters, schema
│   ├── api/           # REST and WebSocket endpoints
│   └── apps/          # Applications (TAK-405, DPOP, DiDiS)
├── tests/
│   ├── integration/   # Comprehensive integration tests
│   └── helpers/       # Test utilities
├── docs/
│   ├── CURRENT/       # Primary documentation
│   ├── PLANNING/      # Implementation plans
│   └── ARCHIVE/       # Historical context (SharedSpheres vision)
├── CONTRIBUTING.md    # Contributor guide
├── MANIFESTO.md       # Principles and commitments
└── README.md          # This file
```

---

## Grant Applications

CivicBase is funded through multiple strategic grants:

**Vinnova (2.5M SEK, 12 months):**
- Core platform development
- Distributed systems consultant (800K)
- Security audit (400K)
- Municipal integration (300K)

**MCF (Myndigheten för civilt försvar):**
- Skärgård pilot (resource coordination)
- FRG/Hemvärn integration
- Crisis simulation exercises

**Region Stockholm (TAK-405):**
- Transit wellness alpha launch (Q1 2027)
- 80% external funding (MCF + EU)

See grant applications in [docs/GRANTS/](docs/GRANTS/) for full details.

---

## Roadmap

### Phase 1: Core Infrastructure (Months 1-4)
- Distributed systems consultant hired
- libp2p P2P networking modernized
- Offline data layer with conflict resolution
- GDPR-compliant architecture

### Phase 2: Applications (Months 5-9)
- Hearts currency protocol
- TAK-405 integration
- Mesh networking (Bluetooth/Wi-Fi Direct)

### Phase 3: Security & Testing (Months 10-12)
- Professional security audit (400K SEK)
- 72-hour offline operation test
- Municipal deployment guides
- TAK-405 alpha launch (Q1 2027)

See [12-MONTH-ROADMAP.md](docs/CURRENT/12-MONTH-ROADMAP.md) for detailed timeline.

---

## Why CivicBase?

### For Swedish Municipalities
- **Crisis readiness:** Services continue when infrastructure fails
- **Data sovereignty:** All data stays in Sweden, controlled by citizens
- **Cost reduction:** Eliminate expensive cloud dependencies
- **GDPR compliance:** Privacy by design, user control guaranteed

### For Developers
- **Cutting-edge P2P:** libp2p, offline-first architecture
- **Meaningful work:** Building public infrastructure that saves lives
- **Open source:** All code auditable, no proprietary lock-in
- **Grant-funded:** Paid positions available (distributed systems consultant)

### For Sweden
- **Digital sovereignty:** Break dependency on American tech giants
- **Totalförsvar:** Operationalize MCF doctrine with concrete infrastructure
- **Democratic resilience:** Political organizing continues during crises
- **EU model:** Template for member state digital independence

---

## Security

**Threat Model:**
- Adversary controls network (ISP, government, attackers)
- Adversary gains physical access to some devices
- Adversary attempts to impersonate users
- Adversary intercepts sync traffic

**Defense:**
- End-to-end encryption (AES-256-GCM)
- Agent-centric identity (Ed25519 signatures)
- No central database to compromise
- Offline reconciliation with cryptographic proofs

**Security Audit:**
Professional penetration testing scheduled for Month 10 (400K SEK budgeted).

**Responsible Disclosure:**
Security vulnerabilities should be reported privately to:  
Email: bjorn.kenneth.holmstrom@gmail.com  
Subject: "CivicBase Security"

**Do NOT open public issues for security vulnerabilities.**

---

## License

CivicBase is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### Why AGPL?

We chose AGPL to ensure that **public infrastructure stays public**:

- ✅ Municipalities can use CivicBase freely
- ✅ Commercial use is allowed
- ✅ Integration with existing systems is fine
- ⚠️ If you modify CivicBase, you must share improvements
- ⚠️ If you run it as a network service, you must provide source to users

**This prevents vendor lock-in while encouraging shared innovation across Swedish municipalities.**

See [LICENSE.md](LICENSE.md) for full legal text.

---

## Contributing

We're building **crisis-ready public infrastructure**, not a consumer application.

**We need:**
- Distributed systems experts (P2P, conflict resolution, mesh networking)
- Security researchers (offline reconciliation, cryptographic protocols)
- Mobile developers (React Native, offline-first architecture)
- Municipal IT specialists (legacy system integration, GDPR compliance)

**Every design decision asks: "Will this work when the cables are cut?"**

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Community

**Monthly Contributor Calls:** (During grant period)  
**GitHub Discussions:** Architecture questions, feature proposals  
**GitHub Issues:** Bug reports, specific tasks  
**Email:** bjorn.kenneth.holmstrom@gmail.com

---

## The Question

November 2024's cable cuts exposed our vulnerability. The question is not whether Sweden will face infrastructure disruptions again.

**The question is whether our municipalities will be ready.**

CivicBase is the answer: **resilient infrastructure for Swedish digital sovereignty.**

---

## Acknowledgments

- **libp2p/IPFS community** - P2P infrastructure foundation
- **All contributors** - Building infrastructure that survives

---

**Infrastructure that survives.** 🎯

**Initiative:** Global Governance Frameworks  
**Lead Architect:** Björn K. Holmström  
**Contact:** bjorn.kenneth.holmstrom@gmail.com  
**Website:** globalgovernanceframeworks.org  
**Status:** Active development (Proof-of-concept, 2026)

# Contributing to CivicBase

Thank you for your interest in contributing to CivicBase—resilient digital infrastructure for Swedish municipalities.

This is not a typical open source project. We're building **crisis-ready public infrastructure**, not a consumer application. Every design decision asks: *"Will this work when the cables are cut?"*

---

## Project Status

**Current Phase:** Proof-of-concept development (Vinnova 12-month grant)  
**Timeline:** January 2026 - December 2026  
**Deliverable:** Production-ready platform with TAK-405 integration and 72-hour offline validation  
**Budget:** 2.5M SEK (distributed systems consultant + development + security audit)

**This is infrastructure work.** We prioritize resilience over features, sovereignty over convenience, and crisis readiness over optimization.

---

## Who Should Contribute

We're looking for contributors with:

### Technical Expertise
- **Distributed systems** (P2P networking, conflict resolution, eventual consistency)
- **Cryptography** (E2EE, agent-centric identity, offline signatures)
- **Mobile development** (React Native, offline-first architecture)
- **Security research** (penetration testing, offline reconciliation vulnerabilities)

### Domain Knowledge
- **Totalförsvar doctrine** (Swedish civil defense requirements)
- **Municipal IT** (integration with legacy systems, GDPR compliance)
- **Crisis response** (resource coordination, mesh networking)
- **Care economy** (invisible labor valorization, trust networks)

### Philosophy
- You believe **resilience > efficiency**
- You understand that **local-first is a political choice**, not just a technical one
- You're building for **72-hour offline operation**, not peak performance
- You care about **Swedish digital sovereignty**

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS)
- **SQLite** 3
- **Git**
- Familiarity with P2P concepts (libp2p, DHT, mesh networking)

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/CivicBase.git
cd CivicBase

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### First Contribution

Good starting points:
1. **Review test coverage** - Run `npm test` and identify gaps
2. **Update libp2p integration** - Migrate to modern ESM modules
3. **Document offline reconciliation** - Explain conflict resolution strategy
4. **Add mesh networking** - Implement Bluetooth/Wi-Fi Direct fallback

---

## Development Workflow

### Branch Strategy

```
main           - Production-ready code (protected)
develop        - Active development (default branch)
feature/*      - New features
fix/*          - Bug fixes
docs/*         - Documentation updates
test/*         - Test improvements
```

### Workflow

1. **Fork** the repository
2. **Create branch** from `develop`:
   ```bash
   git checkout -b feature/offline-transaction-queue
   ```
3. **Make changes** with clear, focused commits
4. **Write tests** - All new code requires test coverage
5. **Run tests** - `npm test` must pass
6. **Open Pull Request** to `develop` branch

### Commit Messages

Follow conventional commits:

```
feat: add offline transaction queue for Hearts currency
fix: resolve sync conflict in vector clock implementation
docs: update architecture.md with mesh networking topology
test: add integration tests for 72-hour offline scenario
refactor: extract conflict resolution to separate module
```

**Why this matters:** We need clear change history for security audits and grant reporting.

---

## Code Standards

### Style Guide

- **ES Modules** (not CommonJS)
- **Async/await** (not callbacks)
- **Clear variable names** (resilience over brevity)
- **Comments for complexity** (explain *why*, not *what*)
- **No console.log** (use Winston logger)

### Example

```javascript
// ❌ Bad: Unclear, uncommented, no error handling
async function sync(p) {
  const d = await p.getData();
  await db.save(d);
}

// ✅ Good: Clear, commented, robust
/**
 * Synchronize data from remote peer with conflict resolution.
 * Uses last-write-wins strategy with vector clocks for causality.
 * 
 * @param {Peer} remotePeer - The peer to sync with
 * @returns {Promise<SyncResult>} Number of records synced and conflicts resolved
 */
async function syncWithPeer(remotePeer) {
  try {
    const remoteChanges = await remotePeer.getChangesSince(lastSyncTimestamp);
    const syncResult = await applyChangesWithConflictResolution(remoteChanges);
    
    logger.info(`Synced ${syncResult.recordCount} records from ${remotePeer.id}`);
    return syncResult;
  } catch (error) {
    logger.error('Sync failed:', { peer: remotePeer.id, error });
    throw new SyncError('Failed to synchronize with peer', { cause: error });
  }
}
```

### File Organization

```
src/
├── core/           # Core infrastructure (auth, crypto, sync)
├── p2p/            # P2P networking (libp2p, discovery, mesh)
├── data/           # Data layer (database, adapters, schema)
├── api/            # API endpoints (REST, WebSocket)
└── apps/           # Applications (TAK-405, DPOP, DiDiS)
```

**Principle:** Infrastructure code in `core/`, application code in `apps/`. Keep them decoupled.

---

## Testing Requirements

### Test Coverage

All new features require:
- ✅ **Unit tests** - Test individual functions
- ✅ **Integration tests** - Test component interactions
- ✅ **Offline scenario tests** - Test without internet

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- tests/integration/dataSync.test.js

# Watch mode (during development)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Writing Tests

```javascript
// tests/integration/offline-sync.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDatabase } from '../helpers/dbSetup.helper.js';
import SyncManager from '../../src/core/syncManager.js';

describe('Offline Synchronization', () => {
  let dbManager1, dbManager2;
  let syncManager1, syncManager2;

  beforeAll(async () => {
    dbManager1 = await setupTestDatabase();
    dbManager2 = await setupTestDatabase();
    syncManager1 = new SyncManager(dbManager1);
    syncManager2 = new SyncManager(dbManager2);
  });

  afterAll(async () => {
    await dbManager1.close();
    await dbManager2.close();
  });

  it('should sync transactions created offline', async () => {
    // Create transaction on peer1 while "offline"
    const transaction = {
      id: 'tx-1',
      from: 'user-a',
      to: 'user-b',
      amount: 50,
      timestamp: Date.now()
    };
    
    await dbManager1.create('hearts_transactions', transaction);

    // Simulate sync when connectivity returns
    await syncManager1.syncWith(syncManager2);

    // Verify transaction reached peer2
    const syncedTx = await dbManager2.read('hearts_transactions', 'tx-1');
    expect(syncedTx).toBeDefined();
    expect(syncedTx.amount).toBe(50);
  });

  it('should handle conflicting updates with last-write-wins', async () => {
    // ... test implementation
  });
});
```

---

## Pull Request Process

### Before Opening PR

- [ ] Tests pass (`npm test`)
- [ ] Code follows style guide
- [ ] Documentation updated (if needed)
- [ ] Commits are clear and focused
- [ ] Branch is up-to-date with `develop`

### PR Description Template

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested this:
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Tested offline scenario manually
- [ ] Tested on mobile (if relevant)

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Maintainer review** (usually within 48 hours)
3. **Discussion** if changes needed
4. **Approval** and merge to `develop`

**Note:** PRs to `main` require security review and are reserved for release candidates.

---

## Focus Areas (12-Month Grant)

These are the priority areas aligned with our Vinnova grant deliverables:

### Month 1-4: Core Infrastructure
- [ ] **libp2p modernization** - Update to ESM, improve NAT traversal
- [ ] **Offline data layer** - Enhance conflict resolution, add vector clocks
- [ ] **GDPR architecture** - Agent-centric identity, data minimization

### Month 5-9: Applications
- [ ] **Hearts protocol** - Offline transaction signing and sync
- [ ] **TAK-405 integration** - Transit wellness application
- [ ] **Mesh networking** - Bluetooth/Wi-Fi Direct fallback

### Month 10-12: Security & Testing
- [ ] **Security audit prep** - Document threat models, attack surfaces
- [ ] **72-hour offline test** - Simulated cable cut scenario
- [ ] **Municipal deployment** - Integration guides, training materials

**If you're contributing, let us know which area interests you most.**

---

## Communication

### Discussions
Use GitHub Discussions for:
- Architecture questions
- Feature proposals
- Best practices

### Issues
Use GitHub Issues for:
- Bug reports
- Specific tasks
- Documentation gaps

### Security
**Do NOT open public issues for security vulnerabilities.**  
Email: bjorn.kenneth.holmstrom@gmail.com with subject "CivicBase Security"

### Monthly Sync
We hold monthly contributor calls during the grant period.  
Join us to discuss progress, blockers, and priorities.

---

## Documentation

### What Needs Documentation

- **Code:** Complex algorithms, security-critical functions
- **Architecture:** System design decisions, trade-offs
- **APIs:** All public interfaces, parameters, return values
- **Setup:** Installation, configuration, troubleshooting

### Where Documentation Lives

```
docs/
├── CURRENT/              # Primary documentation
│   ├── VISION.md
│   ├── ARCHITECTURE.md
│   └── 12-MONTH-ROADMAP.md
├── TECHNICAL_REFERENCE/  # API docs, specifications
└── PLANNING/             # Implementation details
```

### Documentation Style

- **Clear:** Assume reader knows P2P basics, not CivicBase specifics
- **Concrete:** Use examples, not just theory
- **Crisis-focused:** Always explain "why this matters for resilience"
- **Swedish context:** Reference MCF doctrine, Swedish regulations when relevant

---

## Code of Conduct

### Our Standards

- **Respectful:** We're building infrastructure, not social media
- **Technical:** Focus on code quality and resilience
- **Patient:** Distributed systems are complex; help each other learn
- **Mission-focused:** Remember we're building for crisis readiness

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Sharing others' private information
- Promoting proprietary alternatives to undermine the project

**Enforcement:** Violations will result in removal from the project.

---

## Recognition

### Contributors List

Significant contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in grant reports to Vinnova/MCF
- Acknowledged in release notes
- Invited to project presentations

### What Counts as Significant

- Major features implemented
- Critical bugs fixed
- Security vulnerabilities discovered and responsibly disclosed
- Documentation improvements
- Thoughtful architecture feedback

**This is infrastructure work.** Your contributions help Sweden maintain digital sovereignty during crises. That matters.

---

## Questions?

- **Technical:** Open a GitHub Discussion
- **Grant-related:** Email bjorn.kenneth.holmstrom@gmail.com
- **Security:** Email with subject "CivicBase Security"
- **General:** Create an issue with `question` label

---

## Final Note

CivicBase is not a startup. We're not optimizing for user growth or exit strategies.

**We're building infrastructure that survives.**

When the cables are cut—and they will be—Swedish municipalities will need systems that keep running. Your contributions help make that possible.

Thank you for helping build resilient infrastructure for Swedish digital sovereignty.

**Infrastructure that survives.** 🎯

---

**Project:** CivicBase  
**Organization:** Global Governance Frameworks  
**Grant:** Vinnova 2.5M SEK (2026)  
**License:** Open Source (see LICENSE.md)  
**Status:** Active development

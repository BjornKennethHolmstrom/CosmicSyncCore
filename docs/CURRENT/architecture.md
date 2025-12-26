# CivicBase Architecture
## Offline-First Municipal Infrastructure Platform

## Overview

CivicBase is designed as a resilient, modular platform that enables Swedish municipalities to maintain critical services during infrastructure disruptions. The architecture prioritizes **offline-first operation**, **data sovereignty**, and **crisis resilience** while maintaining compatibility with existing municipal IT systems.

**Core Principle:** *Services degrade gracefully under stress, never collapse completely.*

---

## Architectural Layers

```
┌─────────────────────────────────────────────────────────┐
│           Application Layer (TAK-405, DPOP, DiDiS)      │
├─────────────────────────────────────────────────────────┤
│                  SDK / API Layer                        │
├─────────────────────────────────────────────────────────┤
│              Synchronization Layer                      │
├─────────────────────────────────────────────────────────┤
│         P2P Networking Layer (libp2p)                   │
├─────────────────────────────────────────────────────────┤
│          Data Layer (Agent-Centric Storage)             │
├─────────────────────────────────────────────────────────┤
│               Security Layer (E2EE)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Data Layer

### Design Philosophy: Agent-Centric, Not Server-Centric

Traditional municipal IT:
- **Centralized database** → Single point of failure
- **Cloud storage** → Internet dependency
- **Shared state** → Conflict chaos

CivicBase data layer:
- **Agent-owned storage** → Each device controls its data
- **Local-first** → Offline operation by default
- **Eventual consistency** → Sync when possible, not required

### Implementation

**Primary Storage:** SQLite (per-device)
- Fast, embedded, battle-tested
- Full SQL support for complex queries
- ACID transactions for local consistency
- Zero server configuration

**Schema Design:**
```javascript
{
  users: {
    id: 'unique_agent_id',
    email: 'user@example.com',
    username: 'username',
    publicKey: 'ed25519_key',
    timestamp: 1234567890,
    _deleted: 0  // Tombstone for sync
  },
  
  hearts_transactions: {
    id: 'transaction_uuid',
    from: 'agent_id',
    to: 'agent_id',
    amount: 50,
    description: 'Helped with groceries',
    timestamp: 1234567890,
    signature: 'cryptographic_signature',
    synced: false,  // Tracks sync status
    _deleted: 0
  },
  
  sync_metadata: {
    peer_id: 'remote_peer_id',
    last_sync: 1234567890,
    vector_clock: {...}  // For conflict resolution
  }
}
```

**Key Features:**
- **Tombstone deletion:** Records marked `_deleted=1`, not actually removed (enables sync)
- **Timestamp-based versioning:** Last-write-wins conflict resolution
- **Vector clocks:** Track causality for complex conflicts
- **Offline queue:** Transactions logged locally, synced when connectivity returns

---

## 2. P2P Networking Layer

### Why libp2p, Not Blockchain

**Blockchain limitations for municipal services:**
- Requires global internet connectivity
- High energy consumption
- Poor performance at scale
- Immutable ledger (GDPR conflict)
- Consensus overhead

**libp2p advantages:**
- **Battle-tested:** Powers IPFS, Filecoin globally
- **Offline-capable:** Mesh networking, no global dependency
- **Modular:** Choose only needed components
- **NAT traversal:** Works behind firewalls
- **Low overhead:** Minimal resource consumption

### Implementation

```javascript
import Libp2p from 'libp2p';
import { TCP } from '@libp2p/tcp';
import { Noise } from '@chainsafe/libp2p-noise';
import { Mplex } from '@libp2p/mplex';
import { GossipSub } from '@chainsafe/libp2p-gossipsub';
import { KadDHT } from '@libp2p/kad-dht';

const node = await Libp2p.create({
  addresses: {
    listen: ['/ip4/0.0.0.0/tcp/0']
  },
  transports: [tcp()],
  streamMuxers: [mplex()],
  connectionEncryption: [noise()],
  peerDiscovery: [bootstrap({
    list: [/* Swedish bootstrap nodes */]
  })],
  services: {
    pubsub: gossipsub(),
    dht: kadDHT()
  }
});
```

### Network Topology

**Normal Operation (Internet Available):**
```
Device A ←→ Swedish Bootstrap Node ←→ Device B
    ↓                                      ↓
Device C ←→ DHT Discovery            ←→ Device D
```

**Crisis Mode (Cable Cut):**
```
Local Mesh Network (Wi-Fi/Bluetooth):
Device A ←→ Device B
    ↓         ↓
Device C ←→ Device D

(No internet required, local coordination continues)
```

**Key Features:**
- **NAT traversal:** Hole punching, relay fallback
- **Mesh networking:** Bluetooth, Wi-Fi Direct when internet fails
- **Peer discovery:** DHT for global, mDNS for local
- **Connection management:** Auto-reconnect, backoff strategies

---

## 3. Synchronization Layer

### Conflict Resolution Strategy

**Problem:** Two devices edit same record offline, both sync later.

**Solution:** Vector clocks + last-write-wins

```javascript
// Example conflict scenario:
Device A (offline): User updates email to "alice@new.com" at T1
Device B (offline): User updates email to "alice@old.com" at T2

// When both sync:
if (T2 > T1) {
  // Device B wins (last write wins)
  finalEmail = "alice@old.com"
} else {
  // Device A wins
  finalEmail = "alice@new.com"
}

// Vector clock tracks causality:
Device A: {A: 5, B: 3} → knows about 3 of B's changes
Device B: {A: 4, B: 6} → knows about 4 of A's changes

// If neither dominates, use timestamp as tiebreaker
```

### Sync Protocol

```javascript
class SyncManager {
  async syncWith(remotePeer) {
    // 1. Get last sync timestamp for this peer
    const lastSync = await this.db.getLastSyncTimestamp(remotePeer);
    
    // 2. Get changes since last sync
    const remoteChanges = await remotePeer.getChanges(lastSync);
    
    // 3. Apply changes with conflict resolution
    await this.applyChanges(remoteChanges);
    
    // 4. Send local changes to remote peer
    const localChanges = await this.getChanges(lastSync);
    await remotePeer.applyChanges(localChanges);
    
    // 5. Update last sync timestamp
    await this.db.updateLastSyncTimestamp(remotePeer, Date.now());
  }
  
  async applyChanges(changes) {
    for (const [table, records] of Object.entries(changes)) {
      for (const record of records) {
        const existing = await this.db.read(table, record.id);
        
        // Tombstone handling
        if (record._deleted === 1) {
          if (!existing || record.timestamp > existing.timestamp) {
            await this.db.delete(table, record.id);
          }
          continue;
        }
        
        // Conflict resolution
        if (!existing || record.timestamp > existing.timestamp) {
          await this.db.upsert(table, record);
        }
      }
    }
  }
}
```

**Key Features:**
- **Tombstone deletion:** Deleted records sync as `_deleted=1`
- **Timestamp-based:** Simple, predictable conflict resolution
- **Vector clocks:** For complex scenarios requiring causality
- **Incremental sync:** Only changes since last sync
- **Batch operations:** Efficient for large datasets

---

## 4. Security Layer

### End-to-End Encryption

**Threat Model:**
- Adversary controls network (ISP, government, attackers)
- Adversary gains physical access to some devices
- Adversary attempts to impersonate users
- Adversary intercepts sync traffic

**Defense:**
```javascript
class CryptoManager {
  // AES-256-GCM for data encryption
  async encrypt(data, keyId) {
    const key = await this.getKey(keyId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return { 
      iv: iv.toString('hex'), 
      encryptedData: encrypted, 
      authTag: authTag.toString('hex') 
    };
  }
  
  // Ed25519 for signatures (Hearts transactions)
  async sign(transaction, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(transaction));
    return sign.sign(privateKey, 'hex');
  }
}
```

### Authentication & Identity

**Agent-Centric Identity:**
- Each user generates Ed25519 key pair locally
- Public key = user identity (no central registry)
- Private key never leaves device
- Signatures prove authenticity

**Session Management:**
```javascript
// JWT for API authentication
const tokens = await auth.generateTokens(userId);
// {
//   accessToken: '...', // 24h expiry
//   refreshToken: '...' // 7d expiry
// }

// Token verification (offline-capable)
const decoded = await auth.verifyToken(accessToken);
// { userId, type: 'access', exp: ... }
```

**Key Features:**
- **No password transmission:** Only hashed passwords stored
- **PBKDF2 hashing:** 100,000 iterations, salted
- **Token invalidation:** For logout/compromise
- **Refresh rotation:** New refresh token on each use

---

## 5. API Layer

### RESTful Endpoints

```
Authentication:
POST   /api/v1/auth/register       - Create new user
POST   /api/v1/auth/login          - Get access token
POST   /api/v1/auth/refresh        - Refresh access token
POST   /api/v1/auth/logout         - Invalidate session

Users:
GET    /api/v1/users/:id           - Get user profile
PUT    /api/v1/users/:id           - Update user
DELETE /api/v1/users/:id           - Delete user

Data:
POST   /api/v1/data                - Store data
GET    /api/v1/data/:key           - Retrieve data
DELETE /api/v1/data/:key           - Delete data

P2P:
GET    /api/v1/peers               - List connected peers
POST   /api/v1/peers/connect       - Connect to peer
POST   /api/v1/sync/trigger        - Manual sync trigger

Hearts (TAK-405):
POST   /api/v1/hearts/transaction  - Create Hearts transaction
GET    /api/v1/hearts/balance      - Get user balance
GET    /api/v1/hearts/history      - Transaction history
```

### WebSocket API (Real-Time Updates)

```javascript
// Client connection
const ws = new WebSocket('ws://localhost:3000/ws');

// Subscribe to sync events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'sync'
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // { type: 'sync', peer: '...', changes: [...] }
};
```

---

## 6. SDK Layer

### JavaScript/TypeScript SDK

```javascript
import { CivicBase } from 'civicbase-sdk';

const client = new CivicBase({
  apiUrl: 'http://localhost:3000',
  offline: true  // Enable offline mode
});

// Hearts transaction (offline-capable)
await client.hearts.send({
  to: 'user_id',
  amount: 50,
  description: 'Helped with groceries'
});
// Transaction logged locally, syncs when online

// Query balance
const balance = await client.hearts.getBalance();
// Works offline (uses local cache)
```

### Mobile SDKs (React Native)

```javascript
import { CivicBaseMobile } from 'civicbase-mobile';

const client = new CivicBaseMobile({
  apiUrl: 'https://api.civicbase.se',
  meshNetworking: true,  // Enable Bluetooth/Wi-Fi Direct
  offlineStorage: AsyncStorage
});

// Automatic mesh discovery
client.on('peer:discovered', (peer) => {
  console.log(`Found peer via mesh: ${peer.id}`);
});
```

---

## Comparison: CivicBase vs. Traditional Architecture

| Feature | Traditional Municipal IT | CivicBase |
|---------|-------------------------|-----------|
| **Data Storage** | Centralized database (cloud) | Agent-centric (local devices) |
| **Internet Dependency** | 100% required | 0% required (optional) |
| **Single Point of Failure** | Database server, cloud provider | None (distributed) |
| **During Cable Cut** | Total system failure | Continues via mesh network |
| **Data Sovereignty** | Foreign cloud (AWS/Azure) | Swedish devices only |
| **GDPR Compliance** | Complex (centralized data) | Simple (user controls data) |
| **Scalability** | Vertical (expensive servers) | Horizontal (cheap devices) |
| **Attack Surface** | Large (central database) | Small (per-device encryption) |

---

## Crisis Resilience Features

### 1. **Offline Transaction Queue**
All operations work offline by default. When connectivity returns, changes sync automatically.

### 2. **Mesh Network Fallback**
If internet fails, devices communicate via:
- Wi-Fi Direct (Android/iOS)
- Bluetooth (short range)
- Local network (LAN)

### 3. **Graceful Degradation**
System doesn't fail, it degrades:
- **Internet available:** Full sync, global coordination
- **Local network only:** Local coordination, deferred global sync
- **Isolated device:** Read-only (cached data), write queued

### 4. **Eventual Consistency Guarantee**
When any two devices connect (even months later), data automatically reconciles.

---

## Integration with Existing Municipal Systems

### Export Bridges

```javascript
// Export Hearts transactions to municipal accounting
await civicbase.export.toCSV({
  table: 'hearts_transactions',
  format: 'municipal-ledger',
  destination: '/mnt/municipal-share/hearts-export.csv'
});

// Import from existing systems
await civicbase.import.fromSQL({
  source: 'postgresql://municipal-db',
  table: 'citizens',
  mapping: {
    personnummer: 'id',
    epost: 'email'
  }
});
```

### API Gateway for Legacy Systems

```javascript
// Legacy system calls CivicBase
POST /api/v1/compat/soap/createTransaction
<soap:Envelope>
  <hearts:transaction>
    <from>19900101-1234</from>
    <to>19950505-5678</to>
    <amount>25</amount>
  </hearts:transaction>
</soap:Envelope>

// CivicBase translates to modern API
→ POST /api/v1/hearts/transaction
{
  "from": "agent_abc123",
  "to": "agent_xyz789",
  "amount": 25
}
```

---

## Performance Characteristics

### Latency Targets

| Operation | Target | Measured (Phase 3) |
|-----------|--------|--------------------|
| Local data write | <10ms | TBD |
| Local data read | <5ms | TBD |
| P2P message delivery | <100ms | TBD |
| Sync reconciliation | <500ms | TBD |

### Scalability

**Per-Device:**
- Storage: ~1GB for 100,000 transactions
- CPU: Minimal (background sync only)
- Battery: <5% per day (sync + mesh)

**Network:**
- Supports 1,000+ simultaneous P2P connections
- Mesh networks scale to ~100 devices per cluster
- DHT discovery works globally (millions of peers)

---

## Security Audit Focus Areas

### Month 10 Security Audit Scope

1. **Offline Reconciliation**
   - Race conditions during sync?
   - Malformed tombstone handling?
   - Vector clock manipulation?

2. **Cryptographic Implementation**
   - Key storage security?
   - Signature verification robustness?
   - Side-channel vulnerabilities?

3. **Agent Identity Spoofing**
   - Can attacker impersonate legitimate agent?
   - Public key verification bypass?
   - Man-in-the-middle during peer discovery?

4. **Mesh Network Attacks**
   - Sybil attacks (fake peers flooding network)?
   - Eclipse attacks (isolating target device)?
   - Data injection during sync?

---

## Future Architecture Considerations

### Year 2+ Enhancements

**Plugin System:**
- Third-party applications on CivicBase platform
- Sandboxed execution for security
- Standard SDK for developers

**Federated Learning:**
- Privacy-preserving analytics
- Municipal insights without data sharing
- Compliance with GDPR "purpose limitation"

**Blockchain Integration:**
- Optional audit trail (immutable log)
- NOT for transaction processing
- Compliance and transparency only

**IoT Device Support:**
- Sensors, beacons for resource tracking
- Lightweight clients for embedded systems
- Edge computing for real-time processing

---

## Appendix: Technology Stack

### Core Technologies
- **Runtime:** Node.js 20+ (LTS)
- **Language:** JavaScript (ES modules)
- **Database:** SQLite 3
- **P2P:** libp2p (latest stable)
- **Encryption:** Node.js crypto (native)
- **Testing:** Jest, Supertest

### Infrastructure
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** Winston
- **Documentation:** Markdown + Swagger/OpenAPI

### Mobile
- **Framework:** React Native
- **State:** Redux Toolkit
- **Offline:** AsyncStorage + SQLite
- **P2P:** react-native-libp2p (custom bindings)

---

*This architecture prioritizes resilience over features, sovereignty over convenience, and crisis readiness over optimization. Every design decision asks: "Will this work when the cables are cut?"*

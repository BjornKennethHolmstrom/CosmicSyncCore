# GitSyncCore Technical Specification

## Overview

GitSyncCore implements the Git protocol over CivicBase's P2P infrastructure, providing a fully decentralized alternative to centralized Git hosting platforms.

## Core Components

### 1. Repository Management

#### Repository Identification
```javascript
// Repository IDs are content-addressed
repo_id = hash(initial_commit + metadata)
// Example: cosmic://zb2rhYDNyB5KedWkNvW3UQzFpLvYqGNJ8J6X7oXp7yK8nLgM
```

#### Repository Structure
```
.repository/
├── objects/           // Git objects (commits, trees, blobs)
├── refs/             // Branches, tags
├── config            // Repository configuration
└── sync/             // GitSyncCore metadata
    ├── peers         // Known peers hosting this repo
    ├── permissions   // Access control lists
    └── sync-state    // Synchronization status
```

### 2. Git Protocol Implementation

#### Transport Layer
- **Smart HTTP Protocol** over P2P
- **Custom CosmicSync Protocol** for optimized transfers
- **Git-native commands** supported:
  - `git-upload-pack`
  - `git-receive-pack`
  - `git-upload-archive`

#### Protocol Flow
```
Client -> GitSyncCore -> CivicBase Network
     |                      |
     +-- Git Commands ----> P2P Peers
     |                      |
     +-- Object Transfer --> Distributed Storage
```

### 3. Data Storage

#### Git Objects
- Stored in Helia/IPFS using content addressing
- Objects deduplicated automatically
- Local caching with LRU eviction

#### References and Metadata
- Stored in CivicBase's distributed data layer
- Real-time synchronization across peers
- Conflict resolution using CRDTs

## Technical Architecture

### Module Structure
```
src/
├── protocols/
│   ├── git-protocol.js      // Git protocol handlers
│   └── sync-protocol.js     // Custom sync protocol
├── storage/
│   ├── object-store.js      // Git object storage
│   └── ref-store.js         // Reference storage
├── network/
│   ├── peer-discovery.js    // Find repo peers
│   └── replication.js       // Data synchronization
└── api/
    ├── cli.js               // Command-line interface
    └── middleware.js        // Git client integration
```

### Key Classes

#### GitSyncCore
```javascript
class GitSyncCore {
  async initRepo(repoPath) {}
  async clone(repoId, localPath) {}
  async push() {}
  async pull() {}
  async addRemote(name, repoId) {}
}
```

#### ObjectStore
```javascript
class ObjectStore {
  async storeObject(gitObject) {}
  async retrieveObject(hash) {}
  async hasObject(hash) {}
  async listObjects() {}
}
```

#### PeerManager
```javascript
class PeerManager {
  async discoverPeers(repoId) {}
  async announceRepo(repoId) {}
  async syncWithPeer(peerId, repoId) {}
}
```

## Integration with CivicBase

### Using Existing Components

#### P2P Networking
```javascript
// Reuse libp2p from CivicBase
const node = await CivicBase.getP2PNode();
await node.dial(peerId, '/git-sync/1.0.0');
```

#### Distributed Storage
```javascript
// Use Helia adapter for Git objects
const helia = await CivicBase.getHeliaAdapter();
const cid = await helia.store(gitObject);
```

#### Real-time Sync
```javascript
// Leverage existing sync manager
const sync = await CivicBase.getSyncManager();
await sync.syncRepo(repoId);
```

### Custom Extensions

#### Git-specific CRDT
```javascript
class GitCRDT {
  // Custom conflict resolution for Git operations
  resolveRefConflicts(localRefs, remoteRefs) {}
  mergeObjects(base, local, remote) {}
}
```

#### Repository Discovery Protocol
```javascript
// Custom protocol for finding repository peers
protocol: '/git-sync/repo-discovery/1.0.0'
```

## Security Model

### Authentication
- **SSH-key style** cryptographic identities
- **Repository-level permissions** via signed claims
- **Delegated access** for collaborators

### Data Integrity
- **All objects content-addressed** (immutable)
- **Signed commits and tags** verified on sync
- **Tamper-evident history** through hash chains

### Privacy
- **Optional encryption** for private repositories
- **Selective synchronization** - only sync with trusted peers
- **Metadata protection** - hide repository existence from untrusted peers

## Performance Considerations

### Caching Strategy
- **Local object cache** with configurable size
- **Predictive prefetching** of likely-needed objects
- **Delta compression** for network transfers

### Scalability
- **Sharded object storage** across multiple peers
- **Partial cloning** - fetch only needed history
- **Lazy loading** of large files

## API Specification

### Command Line Interface
```bash
# Initialize a new repository
gitsync init

# Clone from GitSyncCore
gitsync clone cosmic://repo-id

# Add GitSyncCore remote
git remote add cosmic cosmic://repo-id

# Push to GitSyncCore network
gitsync push
# or
git push cosmic main
```

### Programmatic API
```javascript
const gitsync = require('gitsynccore');

// Initialize client
const client = await gitsync.createClient();

// Clone repository
await client.clone('cosmic://repo-id', './local-path');

// Create new repository
const repoId = await client.init();
```

## Migration Path

### From Centralized Git
```bash
# 1. Add GitSyncCore remote
git remote add cosmic cosmic://new-repo-id

# 2. Push to both
git push origin main
git push cosmic main

# 3. Gradually transition collaborators
```

### Existing Repository Import
```bash
# Import from GitHub
gitsync import-from-github username/repo

# Import from local Git repo
gitsync import-local /path/to/repo
```

## Testing Strategy

### Unit Tests
- Git object storage and retrieval
- Protocol handlers
- Conflict resolution

### Integration Tests
- Multi-peer synchronization
- Network partition recovery
- Large repository handling

### Compatibility Tests
- Interoperability with standard Git clients
- Cross-platform operation
- Migration from popular Git hosts

---

*This specification evolves as we build. Contributions and feedback welcome!*


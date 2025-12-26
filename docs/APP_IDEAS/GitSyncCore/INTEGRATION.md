# GitSyncCore Integration Guide

> *How GitSyncCore works with existing Git ecosystems and CivicBase platform*

## Integration Overview

GitSyncCore is designed to integrate seamlessly with existing Git workflows while providing a bridge to the decentralized future. This document covers integration points with standard Git tools, CivicBase platform, and third-party services.

## 1. Git Client Integration

### Standard Git CLI

GitSyncCore works as a drop-in replacement for Git remotes:

```bash
# Traditional Git remote
git remote add origin https://github.com/user/repo.git

# GitSyncCore remote
git remote add cosmic cosmic://zb2rhYDNyB5KedWkNvW3UQzFpLvYqGNJ8J6X7oXp7yK8nLgM

# Mixed setup - push to both
git remote set-url --add --push origin https://github.com/user/repo.git
git remote set-url --add --push origin cosmic://repo-id
```

### Git Protocol Support

GitSyncCore implements these standard Git protocols:

| Protocol | Status | Use Case |
|----------|--------|----------|
| **Smart HTTP** | ✅ Phase 2 | Web browsers, standard clients |
| **SSH** | 🔄 Phase 3 | Secure authenticated access |
| **Git** | 🔄 Phase 3 | Direct TCP connections |
| **Custom P2P** | ✅ Phase 1 | Optimized decentralized transfers |

### Git LFS Alternative

```bash
# Traditional Git LFS
git lfs track "*.psd"

# GitSyncCore large file handling (automatic)
# Files >5MB automatically stored in distributed storage
git add large-file.zip  # Handled transparently
```

## 2. CivicBase Platform Integration

### Using Core Services

```javascript
// GitSyncCore bootstrap using CivicBase
const GitSyncCore = require('gitsynccore');
const CivicBase = require('civicbase');

async function setupGitSync() {
  // Initialize with existing CivicBase instance
  const cosmic = await CivicBase.createNode({
    config: 'cosmic-config.json'
  });
  
  const gitsync = await GitSyncCore.create({
    cosmicNode: cosmic,  // Reuse existing node
    storage: cosmic.storage,  // Use shared storage
    network: cosmic.network,  // Use existing P2P
    config: {
      cacheSize: '1GB',
      syncInterval: 30000
    }
  });
  
  return gitsync;
}
```

### Shared Resource Management

```yaml
# CivicBase configuration with GitSyncCore
cosmic:
  network:
    libp2p:
      enabled: true
      bootstrap: ["/dns4/bootstrap.cosmicsync.org/tcp/443/wss/p2p/..."]
  
  storage:
    helia:
      enabled: true
      repo: "./cosmic-storage"
  
  # GitSyncCore specific configuration
  gitsync:
    enabled: true
    objectCache: "512MB"
    maxRepoSize: "10GB"
    publicRepos: true
```

### Event System Integration

```javascript
// Cross-application events
cosmic.eventBus.on('gitsync:push', async (event) => {
  const { repoId, commit, author } = event;
  
  // Trigger CI/CD pipeline
  await triggerCICD(repoId, commit);
  
  // Update search index
  await updateSearchIndex(repoId);
  
  // Notify collaborators
  await notifyCollaborators(repoId, author, commit);
});

// Repository lifecycle events
cosmic.eventBus.on('gitsync:repo-created', (repo) => {
  console.log(`New repository: ${repo.name} (${repo.id})`);
  // Auto-configure monitoring, backups, etc.
});
```

## 3. IDE and Editor Integration

### VS Code Extension

```json
// .vscode/settings.json
{
  "gitsync.enabled": true,
  "gitsync.autoSync": true,
  "gitsync.repoId": "cosmic://zb2rhYDNyB5KedWkNvW3UQzFpLvYqGNJ8J6X7oXp7yK8nLgM",
  "gitsync.peerDiscovery": "automatic"
}
```

### JetBrains IDE Plugin

```xml
<!-- .idea/gitsync.xml -->
<component name="GitSyncCore">
  <option name="repositoryId" value="cosmic://repo-id" />
  <option name="autoFetch" value="true" />
  <option name="preferredPeers" value="peer1,peer2" />
</component>
```

### Command Line Completion

```bash
# Bash completion for GitSyncCore commands
source <(gitsync completion bash)

# Usage examples
gitsync clone cosmic://repo-id <TAB>  # Show available repos
gitsync push --to <TAB>              # Show available peers
```

## 4. CI/CD Pipeline Integration

### GitHub Actions Alternative

```yaml
# .gitsync/ci.yml
name: GitSyncCore CI

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: gitsync-network  # Distributed CI runners
    
    steps:
    - name: Checkout
      uses: gitsync/checkout@v1
      with:
        repo-id: ${{ env.REPO_ID }}
        
    - name: Test
      run: |
        npm install
        npm test
        
    - name: Report
      uses: gitsync/report@v1
      with:
        peers: ${{ secrets.TRUSTED_PEERS }}
```

### Jenkins Integration

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    triggers {
        gitsync(repoId: 'cosmic://repo-id', branches: 'main')
    }
    
    stages {
        stage('Build') {
            steps {
                gitsyncCheckout repoId: 'cosmic://repo-id'
                sh 'make build'
            }
        }
    }
}
```

## 5. Migration from Centralized Platforms

### GitHub Migration Tool

```bash
# Migrate repository from GitHub
gitsync migrate-from-github \
  --source https://github.com/user/repo \
  --target cosmic://new-repo-id \
  --include-issues \
  --include-wiki \
  --mirror

# Incremental sync (keep GitHub as backup)
gitsync mirror-github \
  --github-repo user/repo \
  --gitsync-repo cosmic://repo-id \
  --schedule "*/5 * * * *"  # Sync every 5 minutes
```

### GitLab Migration

```bash
# Migrate from GitLab with history
gitsync migrate-from-gitlab \
  --project-id 12345 \
  --instance https://gitlab.com \
  --token $GITLAB_TOKEN \
  --target cosmic://repo-id
```

## 6. Third-Party Service Integration

### Monitoring and Analytics

```javascript
// Custom monitoring integration
class GitSyncMonitor {
  async setupMonitoring(repoId) {
    // Integrate with Prometheus
    await prometheus.register(gitSyncMetrics);
    
    // Send to distributed logging
    await logger.configure({
      service: 'gitsync',
      repoId: repoId,
      peers: await this.getRepoPeers(repoId)
    });
  }
}
```

### Search and Discovery

```javascript
// Repository search integration
class GitSyncSearch {
  async indexRepository(repoId) {
    const repo = await this.getRepoManifest(repoId);
    const content = await this.extractSearchContent(repoId);
    
    // Index in distributed search
    await searchEngine.index({
      id: repoId,
      name: repo.name,
      description: repo.description,
      content: content,
      lastUpdate: repo.updated,
      peers: repo.peers
    });
  }
}
```

## 7. Federation with Other Git Services

### Hybrid Deployment

```bash
# Run GitSyncCore alongside traditional Git server
# Traditional Git (for compatibility)
git clone https://git.example.com/user/repo.git

# GitSyncCore (for decentralization)
git clone cosmic://repo-id

# Sync between them
gitsync bridge \
  --source https://git.example.com/user/repo.git \
  --target cosmic://repo-id \
  --bidirectional
```

### Cross-Platform Mirroring

```yaml
# gitsync-mirror.yml
mirrors:
  - name: "github-backup"
    source: "cosmic://primary-repo-id"
    targets:
      - "https://github.com/user/repo.git"
      - "https://gitlab.com/user/repo.git"
    schedule: "*/10 * * * *"  # Every 10 minutes
    
  - name: "community-sync"
    sources:
      - "cosmic://community-repo-id"
      - "https://github.com/community/repo.git"
    target: "cosmic://aggregated-repo-id"
```

## 8. API Integration

### REST API

```javascript
// GitSyncCore HTTP API
const express = require('express');
const app = express();

app.get('/repos/:repoId', async (req, res) => {
  const repo = await gitsync.getRepo(req.params.repoId);
  res.json(repo);
});

app.post('/repos/:repoId/sync', async (req, res) => {
  const result = await gitsync.syncRepo(req.params.repoId);
  res.json({ status: 'syncing', syncId: result.id });
});
```

### GraphQL API

```graphql
type Query {
  repository(id: ID!): Repository
  searchRepositories(query: String!): [Repository]
  repositoryPeers(repoId: ID!): [Peer]
}

type Mutation {
  syncRepository(repoId: ID!): SyncResult
  createRepository(input: CreateRepoInput!): Repository
}
```

## 9. Mobile and Edge Integration

### Mobile Client

```javascript
// React Native integration
import { GitSyncCore } from 'gitsynccore-react-native';

const gitsync = new GitSyncCore({
  storage: 'react-native-async-storage',
  network: 'react-native-libp2p'
});

// Lightweight mobile operations
await gitsync.cloneLightweight(repoId, {
  depth: 1,          // Shallow clone
  noHistory: true,   // Skip history
  sparse: true       // Only necessary files
});
```

### Progressive Web App

```javascript
// PWA service worker integration
self.addEventListener('push', (event) => {
  if (event.data.text().startsWith('gitsync:')) {
    const notification = JSON.parse(event.data.text().slice(8));
    self.registration.showNotification(notification.title, {
      body: notification.message,
      icon: '/gitsync-icon.png'
    });
  }
});
```

## 10. Custom Integration Examples

### Custom Git Hooks

```bash
#!/bin/bash
# .gitsync/hooks/pre-push

# Validate commits before pushing to network
echo "Validating commits for GitSyncCore push..."

# Check commit signatures
gitsync verify-commits

# Run custom business logic
node ./scripts/pre-push-validation.js

# Only push if all checks pass
exit 0
```

### Plugin Development

```javascript
// Custom GitSyncCore plugin
class MyGitSyncPlugin {
  constructor() {
    this.name = 'my-custom-plugin';
    this.version = '1.0.0';
  }
  
  async onPush(event) {
    // Custom push handling
    await this.notifyStakeholders(event.repoId, event.commits);
    await this.updateExternalSystems(event);
  }
  
  async onClone(event) {
    // Custom clone behavior
    await this.setupProjectEnvironment(event.repoId);
  }
}

// Register plugin
gitsync.plugins.register(new MyGitSyncPlugin());
```

---

*This integration guide demonstrates GitSyncCore's flexibility in working with existing tools while providing a path to full decentralization. Contributions and integration examples welcome!*


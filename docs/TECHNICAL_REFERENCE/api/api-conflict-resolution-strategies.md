# Conflict Resolution Strategies

In a P2P system like CivicBase, conflicts can arise when multiple users or devices modify the same data concurrently. Implementing effective conflict resolution strategies is crucial for maintaining data consistency and providing a smooth user experience.

## 1. Last Write Wins (LWW)

The simplest strategy, where the most recent update takes precedence.

```javascript
function resolveConflictLWW(localVersion, remoteVersion) {
  return localVersion.timestamp > remoteVersion.timestamp ? localVersion : remoteVersion;
}

cosmicSync.setConflictResolver('UserProfile', resolveConflictLWW);
```

## 2. Custom Merge Strategy

Implement a custom merge strategy for more complex data structures.

```javascript
function mergeUserProfiles(local, remote) {
  return {
    ...local,
    ...remote,
    interests: [...new Set([...local.interests, ...remote.interests])],
    friends: [...new Set([...local.friends, ...remote.friends])]
  };
}

cosmicSync.setConflictResolver('UserProfile', mergeUserProfiles);
```

## 3. Operational Transformation (OT)

For collaborative editing, implement Operational Transformation.

```javascript
class OTResolver {
  constructor() {
    this.operations = [];
  }

  addOperation(operation) {
    this.operations.push(operation);
  }

  transform(operation1, operation2) {
    // Implement OT logic here
  }

  resolve() {
    let result = this.operations[0];
    for (let i = 1; i < this.operations.length; i++) {
      result = this.transform(result, this.operations[i]);
    }
    return result;
  }
}

const otResolver = new OTResolver();
cosmicSync.setConflictResolver('CollaborativeDocument', (local, remote) => {
  otResolver.addOperation(local);
  otResolver.addOperation(remote);
  return otResolver.resolve();
});
```

## 4. Conflict-free Replicated Data Types (CRDTs)

Use CRDTs for automatically mergeable data structures.

```javascript
class GCounter {
  constructor(id) {
    this.id = id;
    this.counts = {};
  }

  increment() {
    this.counts[this.id] = (this.counts[this.id] || 0) + 1;
  }

  merge(other) {
    for (const [id, count] of Object.entries(other.counts)) {
      this.counts[id] = Math.max(this.counts[id] || 0, count);
    }
  }

  value() {
    return Object.values(this.counts).reduce((sum, count) => sum + count, 0);
  }
}

cosmicSync.setConflictResolver('Counter', (local, remote) => {
  local.merge(remote);
  return local;
});
```

## 5. Version Vectors

Use version vectors to detect and resolve conflicts.

```javascript
class VersionVector {
  constructor() {
    this.vector = {};
  }

  increment(nodeId) {
    this.vector[nodeId] = (this.vector[nodeId] || 0) + 1;
  }

  compare(other) {
    let aGreater = false;
    let bGreater = false;

    for (const nodeId of new Set([...Object.keys(this.vector), ...Object.keys(other.vector)])) {
      const aValue = this.vector[nodeId] || 0;
      const bValue = other.vector[nodeId] || 0;
      if (aValue > bValue) aGreater = true;
      if (bValue > aValue) bGreater = true;
    }

    if (aGreater && !bGreater) return 1;
    if (bGreater && !aGreater) return -1;
    if (!aGreater && !bGreater) return 0;
    return null; // Conflict
  }
}

function resolveWithVersionVector(local, remote) {
  const comparison = local.versionVector.compare(remote.versionVector);
  if (comparison === 1) return local;
  if (comparison === -1) return remote;
  if (comparison === 0) return local; // No changes
  // Handle conflict
  return mergeStrategy(local, remote);
}

cosmicSync.setConflictResolver('VersionedDocument', resolveWithVersionVector);
```

## 6. Three-Way Merge

Implement a three-way merge strategy using a common ancestor.

```javascript
function threeWayMerge(local, remote, ancestor) {
  const merged = { ...ancestor };
  for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    if (local[key] === remote[key]) {
      merged[key] = local[key];
    } else if (local[key] === ancestor[key]) {
      merged[key] = remote[key];
    } else if (remote[key] === ancestor[key]) {
      merged[key] = local[key];
    } else {
      // Conflict, need manual resolution or use a custom merge strategy
      merged[key] = manuallyResolveConflict(local[key], remote[key], ancestor[key]);
    }
  }
  return merged;
}

cosmicSync.setConflictResolver('ComplexDocument', async (local, remote) => {
  const ancestor = await cosmicSync.getCommonAncestor(local.id, remote.id);
  return threeWayMerge(local, remote, ancestor);
});
```

## 7. User-Assisted Resolution

For complex conflicts, involve the user in the resolution process.

```javascript
async function userAssistedResolver(local, remote) {
  const conflicts = findConflicts(local, remote);
  if (conflicts.length === 0) return local;

  const resolutions = await presentConflictsToUser(conflicts);
  return applyResolutions(local, remote, resolutions);
}

cosmicSync.setConflictResolver('CriticalData', userAssistedResolver);
```

## Best Practices for Conflict Resolution

1. Choose the appropriate strategy based on data type and application requirements.
2. Implement conflict detection as early as possible in the sync process.
3. Log conflicts for analysis and improvement of resolution strategies.
4. Provide clear feedback to users when conflicts occur and how they were resolved.
5. Allow manual conflict resolution for critical data when automatic resolution is not sufficient.
6. Test conflict resolution strategies thoroughly with various scenarios.

By implementing these conflict resolution strategies, you can ensure that your CivicBase-based application handles data conflicts gracefully, maintaining data consistency across the P2P network.

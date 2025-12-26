# Offline Functionality and Sync

CivicBase is designed to support offline functionality, allowing applications to work seamlessly even without an internet connection. This guide explains how to implement offline support and data synchronization.

## Offline Data Storage

Applications should implement local storage to cache data and enable offline functionality. CivicBase provides methods to facilitate this:

```javascript
// Store data locally
await cosmicSync.storeLocally(modelId, instanceId, data);

// Retrieve locally stored data
const localData = await cosmicSync.getLocalData(modelId, instanceId);
```

## Offline Actions Queue

When offline, all actions (create, update, delete) should be queued locally:

```javascript
// Queue an action
await cosmicSync.queueOfflineAction({
  type: 'update',
  modelId: 'UserProfile',
  instanceId: 'profile_123',
  data: { interests: ['hiking', 'photography'] }
});

// Get queued actions
const queuedActions = await cosmicSync.getQueuedActions();
```

## Sync Process

When the application comes back online, it should initiate the sync process:

```javascript
async function syncData() {
  const syncResult = await cosmicSync.sync();
  console.log(`Synced ${syncResult.syncedCount} items`);
  if (syncResult.conflicts.length > 0) {
    handleConflicts(syncResult.conflicts);
  }
}
```

## Conflict Resolution

In case of conflicts (when the same data was modified offline and online), you need to implement a conflict resolution strategy:

```javascript
function handleConflicts(conflicts) {
  conflicts.forEach(conflict => {
    const resolution = promptUserForResolution(conflict);
    cosmicSync.resolveConflict(conflict.id, resolution);
  });
}
```

## Optimistic UI Updates

To provide a seamless user experience, implement optimistic UI updates:

```javascript
async function updateProfile(profileId, updates) {
  // Immediately update UI
  updateUIOptimistically(profileId, updates);
  
  // Queue the update
  await cosmicSync.queueOfflineAction({
    type: 'update',
    modelId: 'UserProfile',
    instanceId: profileId,
    data: updates
  });
  
  // If online, sync immediately
  if (navigator.onLine) {
    await syncData();
  }
}
```

## Sync Strategies

1. **Periodic Sync**: Set up a timer to attempt sync at regular intervals.
2. **On Connection**: Trigger sync when the device comes online.
3. **Manual Sync**: Allow users to manually trigger a sync.

```javascript
// Periodic Sync
setInterval(syncData, 5 * 60 * 1000); // Every 5 minutes

// On Connection
window.addEventListener('online', syncData);

// Manual Sync
document.getElementById('syncButton').addEventListener('click', syncData);
```

## Partial Sync

For large datasets, implement partial sync to only sync recent changes:

```javascript
async function partialSync() {
  const lastSyncTimestamp = await getLastSyncTimestamp();
  const partialSyncResult = await cosmicSync.partialSync(lastSyncTimestamp);
  updateLastSyncTimestamp(Date.now());
}
```

## Best Practices

1. Always check connection status before making API calls.
2. Implement a robust retry mechanism for failed sync attempts.
3. Provide clear UI indicators for sync status and offline mode.
4. Regularly clean up old offline data to manage storage efficiently.
5. Test thoroughly with various network conditions and offline scenarios.

By implementing these offline and sync features, your application can provide a seamless experience to users, regardless of their network connectivity.

# Custom Business Logic Implementation

CosmicSyncCore allows you to extend its functionality by implementing custom business logic. This enables you to create tailored behaviors for your specific application needs.

## Custom Validators

You can define custom validators to ensure data integrity before it's saved or updated.

### Defining a Custom Validator

```javascript
const customValidator = {
  name: 'ensurePositiveBalance',
  model: 'UserAccount',
  validate: async function(data, context) {
    if (data.balance < 0) {
      throw new Error('Account balance cannot be negative');
    }
  }
};

cosmicSync.registerValidator(customValidator);
```

### Using the Custom Validator

The validator will automatically be applied when creating or updating instances of the specified model:

```javascript
try {
  await cosmicSync.updateInstance('UserAccount', 'account_123', { balance: -50 });
} catch (error) {
  console.error(error.message); // "Account balance cannot be negative"
}
```

## Custom Triggers

Triggers allow you to execute custom logic before or after certain events.

### Defining a Custom Trigger

```javascript
const customTrigger = {
  name: 'notifyOnLowBalance',
  model: 'UserAccount',
  event: 'afterUpdate',
  handler: async function(data, context) {
    if (data.balance < 100) {
      await sendLowBalanceNotification(data.userId);
    }
  }
};

cosmicSync.registerTrigger(customTrigger);
```

### Trigger Execution

The trigger will automatically execute after a UserAccount instance is updated:

```javascript
await cosmicSync.updateInstance('UserAccount', 'account_123', { balance: 75 });
// This will automatically call the notifyOnLowBalance trigger
```

## Custom Query Methods

You can define custom query methods to encapsulate complex query logic.

### Defining a Custom Query Method

```javascript
const customQuery = {
  name: 'findActiveProjectsByUser',
  model: 'Project',
  query: async function(userId) {
    return await cosmicSync.query('Project', {
      createdBy: userId,
      status: 'active',
      endDate: { $gt: new Date() }
    });
  }
};

cosmicSync.registerQueryMethod(customQuery);
```

### Using the Custom Query Method

```javascript
const activeProjects = await cosmicSync.Project.findActiveProjectsByUser('user_123');
```

## Extending Models

You can extend existing models with custom methods.

### Defining a Custom Model Method

```javascript
cosmicSync.extendModel('UserProfile', {
  fullName: function() {
    return `${this.firstName} ${this.lastName}`;
  },
  isAdult: function() {
    return (new Date().getFullYear() - this.birthYear) >= 18;
  }
});
```

### Using Custom Model Methods

```javascript
const user = await cosmicSync.getInstance('UserProfile', 'user_123');
console.log(user.fullName());
console.log(user.isAdult());
```

## Custom Sync Strategies

You can implement custom sync strategies for specific models.

### Defining a Custom Sync Strategy

```javascript
const customSyncStrategy = {
  name: 'lastWriteWins',
  model: 'ChatMessage',
  resolve: async function(localData, remoteData) {
    return localData.timestamp > remoteData.timestamp ? localData : remoteData;
  }
};

cosmicSync.registerSyncStrategy(customSyncStrategy);
```

## Best Practices for Custom Business Logic

1. Keep custom logic stateless to ensure consistency across devices
2. Minimize the use of external APIs in custom logic to maintain offline functionality
3. Implement proper error handling in all custom logic
4. Test custom logic thoroughly, including edge cases
5. Document all custom logic for easier maintenance

By leveraging these custom business logic features, you can tailor CosmicSyncCore to meet your specific application requirements while maintaining the benefits of its P2P architecture.

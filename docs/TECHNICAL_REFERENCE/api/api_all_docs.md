# CivicBase API: Additional Sections

## Webhooks

Webhooks allow your application to receive real-time notifications about events in CivicBase.

### Configuring Webhooks

- **URL**: `/webhooks`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer <your_token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "url": "https://your-app.com/webhook-endpoint",
    "events": ["user.created", "data.updated"],
    "secret": "your_webhook_secret"
  }
  ```

### Webhook Payload

When an event occurs, CivicBase will send a POST request to your specified URL with a payload similar to:

```json
{
  "event": "data.updated",
  "data": {
    "model": "UserProfile",
    "instanceId": "profile_123",
    "changes": {
      "interests": ["hiking", "photography"]
    }
  },
  "timestamp": 1632150985
}
```

## Batch Operations

Perform operations on multiple resources in a single API call.

### Batch Create

- **URL**: `/batch`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "operations": [
      {
        "method": "POST",
        "path": "/data/UserProfile",
        "body": { /* profile data */ }
      },
      {
        "method": "POST",
        "path": "/data/Project",
        "body": { /* project data */ }
      }
    ]
  }
  ```

## Data Export and Import

### Export Data

- **URL**: `/export`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "models": ["UserProfile", "Project"],
    "format": "json"
  }
  ```

### Import Data

- **URL**: `/import`
- **Method**: `POST`
- **Body**: Multipart form data with a file upload

## SDK Documentation

CivicBase provides SDKs for several programming languages:

- JavaScript/TypeScript
- Python
- Ruby
- Java
- C#

Each SDK provides a similar interface to the REST API, with additional language-specific features.

## Best Practices and Optimization

1. Use batch operations for multiple related actions
2. Implement efficient caching strategies
3. Use webhooks for real-time updates instead of polling
4. Optimize queries by only requesting necessary fields
5. Implement proper error handling and retries

## API Reference

For a complete list of all available endpoints, parameters, and response formats, please refer to our interactive API reference at:

```
https://api.civicbase.com/docs
```

This reference is automatically generated from our OpenAPI specification and is always up-to-date with the latest API changes.
# Advanced Security Features

CivicBase provides a range of advanced security features to protect your application and user data.

## End-to-End Encryption

Implement end-to-end encryption for sensitive data to ensure it remains private even if intercepted.

### Setting Up Encryption

```javascript
const CryptoJS = require('crypto-js');

class E2EEncryption {
  constructor(key) {
    this.key = key;
  }

  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.key).toString();
  }

  decrypt(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}

const e2e = new E2EEncryption('user_specific_key');
```

### Using Encryption in Data Operations

```javascript
// Encrypting data before storing
const sensitiveData = { ssn: '123-45-6789' };
const encryptedData = e2e.encrypt(sensitiveData);
await cosmicSync.updateInstance('UserProfile', 'user_123', { encryptedInfo: encryptedData });

// Decrypting data after retrieval
const user = await cosmicSync.getInstance('UserProfile', 'user_123');
const decryptedInfo = e2e.decrypt(user.encryptedInfo);
```

## Two-Factor Authentication (2FA)

Implement 2FA to add an extra layer of security to user accounts.

### Setting Up 2FA

```javascript
const speakeasy = require('speakeasy');

// Generate a secret key for the user
const secret = speakeasy.generateSecret({ length: 32 });

// Save the secret key with the user's profile
await cosmicSync.updateInstance('UserProfile', 'user_123', { twoFactorSecret: secret.base32 });

// Generate a QR code URL for the user to scan
const qrCodeUrl = speakeasy.otpauthURL({
  secret: secret.ascii,
  label: 'MyApp',
  issuer: 'CivicBase'
});
```

### Verifying 2FA Tokens

```javascript
async function verify2FA(userId, token) {
  const user = await cosmicSync.getInstance('UserProfile', userId);
  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token
  });
}
```

## Secure Key Management

Use a secure key management system to store and manage encryption keys and other sensitive credentials.

```javascript
const keytar = require('keytar');

async function getEncryptionKey(userId) {
  return await keytar.getPassword('CivicBase', userId);
}

async function setEncryptionKey(userId, key) {
  await keytar.setPassword('CivicBase', userId, key);
}
```

## Rate Limiting

Implement rate limiting to prevent abuse and protect against brute-force attacks.

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply to all API routes
app.use('/api/', apiLimiter);
```

## JSON Web Token (JWT) with Short Expiry and Refresh Tokens

Use JWTs with short expiry times and implement a refresh token mechanism for enhanced security.

```javascript
const jwt = require('jsonwebtoken');

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, 'access_secret_key', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, 'refresh_secret_key', { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, 'refresh_secret_key');
    const accessToken = jwt.sign({ userId: decoded.userId }, 'access_secret_key', { expiresIn: '15m' });
    return accessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
```

## Secure WebSocket Connections

Ensure WebSocket connections are secure and authenticated.

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Verify the JWT token from the request
  const token = req.url.split('token=')[1];
  try {
    const decoded = jwt.verify(token, 'access_secret_key');
    ws.userId = decoded.userId;
  } catch (error) {
    ws.close();
    return;
  }

  // Handle messages
  ws.on('message', (message) => {
    // Process authenticated messages
  });
});
```

## Regular Security Audits

Conduct regular security audits to identify and address potential vulnerabilities:

1. Perform static code analysis
2. Conduct penetration testing
3. Review and update security policies
4. Check for outdated dependencies and update them
5. Review access controls and permissions

## Secure Data Erasure

Implement secure data erasure methods to ensure data is completely removed when requested.

```javascript
async function secureErase(userId) {
  // Overwrite data with random values before deletion
  await cosmicSync.updateInstance('UserProfile', userId, {
    personalInfo: crypto.randomBytes(100).toString('hex')
  });
  
  // Delete the instance
  await cosmicSync.deleteInstance('UserProfile', userId);
  
  // Clear any associated local storage
  await cosmicSync.clearLocalData(userId);
}
```

By implementing these advanced security features, you can significantly enhance the security of your application built on CivicBase, protecting both your users' data and your application's integrity.
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
# Custom Business Logic Implementation

CivicBase allows you to extend its functionality by implementing custom business logic. This enables you to create tailored behaviors for your specific application needs.

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

By leveraging these custom business logic features, you can tailor CivicBase to meet your specific application requirements while maintaining the benefits of its P2P architecture.
# Data Models and CRUD Operations

## Defining Custom Data Models

CivicBase allows applications to define custom data models dynamically. This is done through the `/data-models` endpoint.

### Create a Data Model

- **URL**: `/data-models`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body**:
  ```json
  {
    "name": "Task",
    "fields": [
      {
        "name": "title",
        "type": "string",
        "required": true
      },
      {
        "name": "description",
        "type": "string",
        "required": false
      },
      {
        "name": "due_date",
        "type": "date",
        "required": true
      },
      {
        "name": "status",
        "type": "enum",
        "options": ["TODO", "IN_PROGRESS", "DONE"],
        "default": "TODO"
      }
    ]
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: 
    ```json
    {
      "message": "Data model created successfully",
      "model_id": "task_12345"
    }
    ```

### Retrieve a Data Model

- **URL**: `/data-models/<model_id>`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: JSON representation of the data model

## CRUD Operations

Once a data model is defined, you can perform CRUD operations on instances of that model.

### Create an Instance

- **URL**: `/data/<model_id>`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body**: JSON object conforming to the data model
- **Success Response**:
  - **Code**: 201
  - **Content**: 
    ```json
    {
      "message": "Instance created successfully",
      "instance_id": "task_instance_67890"
    }
    ```

### Retrieve an Instance

- **URL**: `/data/<model_id>/<instance_id>`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: JSON representation of the instance

### Update an Instance

- **URL**: `/data/<model_id>/<instance_id>`
- **Method**: `PUT`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body**: JSON object with fields to update
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "message": "Instance updated successfully"
    }
    ```

### Delete an Instance

- **URL**: `/data/<model_id>/<instance_id>`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Success Response**:
  - **Code**: 204

### List Instances

- **URL**: `/data/<model_id>`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `per_page`: Items per page (default: 20, max: 100)
  - `sort`: Field to sort by (default: created_at)
  - `order`: Sort order (asc or desc, default: desc)
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "items": [
        // Array of instance objects
      ],
      "total": 45,
      "page": 1,
      "per_page": 20
    }
    ```

## Data Validation

CivicBase automatically validates data against the defined model. If validation fails, you'll receive a 400 Bad Request response with details about the validation errors.

Example validation error response:
```json
{
  "error": "Validation failed",
  "details": {
    "title": "This field is required",
    "status": "Invalid option. Must be one of: TODO, IN_PROGRESS, DONE"
  }
}
```
# Data Privacy and GDPR Compliance

CivicBase is designed with a privacy-first approach, ensuring that your application can easily comply with data protection regulations like GDPR.

## Data Storage and Processing

### Local-First Approach

CivicBase prioritizes local data storage and processing:

1. User data is primarily stored and processed on the user's device
2. Only necessary, non-personal data is synchronized with the P2P network
3. Sensitive personal information is encrypted before any network transmission

### Data Minimization

Implement data minimization by only collecting and processing data that's absolutely necessary:

```javascript
const userProfile = {
  interests: ['hiking', 'photography'],
  skills: ['JavaScript', 'React'],
  // Avoid storing unnecessary personal data
  // fullName: 'John Doe',
  // dateOfBirth: '1990-01-01'
};

await cosmicSync.createInstance('UserProfile', userProfile);
```

## User Rights and Controls

### Right to Access

Provide users with easy access to their data:

```javascript
async function getUserData(userId) {
  const userData = await cosmicSync.getInstance('UserProfile', userId);
  return userData;
}
```

### Right to Rectification

Allow users to easily update their information:

```javascript
async function updateUserData(userId, updates) {
  await cosmicSync.updateInstance('UserProfile', userId, updates);
}
```

### Right to Erasure (Right to be Forgotten)

Implement a thorough data deletion process:

```javascript
async function deleteUserData(userId) {
  // Delete user profile
  await cosmicSync.deleteInstance('UserProfile', userId);
  
  // Delete associated data
  await cosmicSync.query('Project', { createdBy: userId }).then(projects => {
    projects.forEach(project => cosmicSync.deleteInstance('Project', project.id));
  });
  
  // Clear local storage
  await cosmicSync.clearLocalData(userId);
  
  // Notify P2P network to remove user data
  await cosmicSync.notifyPeerDeletion(userId);
}
```

### Data Portability

Provide a way for users to export their data in a common format:

```javascript
async function exportUserData(userId) {
  const userData = await getUserData(userId);
  const projects = await cosmicSync.query('Project', { createdBy: userId });
  
  const exportData = {
    userProfile: userData,
    projects: projects
  };
  
  return JSON.stringify(exportData);
}
```

## Consent Management

Implement a robust consent management system:

```javascript
async function updateUserConsent(userId, consentOptions) {
  await cosmicSync.updateInstance('UserConsent', userId, consentOptions);
}

async function checkUserConsent(userId, consentType) {
  const userConsent = await cosmicSync.getInstance('UserConsent', userId);
  return userConsent[consentType] === true;
}
```

## Data Encryption

Implement end-to-end encryption for sensitive data:

```javascript
const CryptoJS = require('crypto-js');

function encryptData(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

function decryptData(encryptedData, key) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Usage
const sensitiveData = { personalInfo: 'Sensitive content' };
const encryptionKey = 'user_specific_encryption_key';
const encryptedData = encryptData(sensitiveData, encryptionKey);

await cosmicSync.updateInstance('UserProfile', userId, { 
  encryptedPersonalInfo: encryptedData 
});
```

## Data Breach Notification

Implement a system to detect and notify users of potential data breaches:

```javascript
async function notifyDataBreach(affectedUserIds) {
  for (const userId of affectedUserIds) {
    const user = await cosmicSync.getInstance('UserProfile', userId);
    await sendDataBreachEmail(user.email);
  }
}
```

## Regular Privacy Audits

Conduct regular privacy audits to ensure ongoing compliance:

1. Review data collection practices
2. Check data retention periods
3. Verify that consent is properly obtained and recorded
4. Test data deletion and portability features
5. Review and update privacy policies

## Privacy Policy

Maintain a clear and comprehensive privacy policy that outlines:

1. What data is collected and why
2. How data is processed and stored
3. User rights and how to exercise them
4. Data retention periods
5. How to contact your Data Protection Officer

By implementing these practices and features, your application can maintain a high standard of data privacy and comply with GDPR and other data protection regulations while using CivicBase.
# Error Handling, Rate Limiting, and API Versioning

## Error Handling

CivicBase uses conventional HTTP response codes to indicate the success or failure of an API request. In general:

- Codes in the 2xx range indicate success
- Codes in the 4xx range indicate an error that failed given the information provided (e.g., a required parameter was missing)
- Codes in the 5xx range indicate an error with CivicBase's servers

### Error Response Format

All error responses include a JSON object with an `error` key containing a human-readable error message. Some errors may also include an `error_code` for programmatic error handling.

Example error response:

```json
{
  "error": "Invalid authentication token provided",
  "error_code": "AUTH_INVALID_TOKEN"
}
```

### Common Error Codes

| HTTP Status Code | Error Code | Description |
|------------------|------------|-------------|
| 400 | BAD_REQUEST | The request was unacceptable, often due to missing a required parameter |
| 401 | UNAUTHORIZED | No valid API key provided |
| 403 | FORBIDDEN | The API key doesn't have permissions to perform the request |
| 404 | NOT_FOUND | The requested resource doesn't exist |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests hit the API too quickly |
| 500 | INTERNAL_SERVER_ERROR | Something went wrong on CivicBase's end |

### Handling Errors

When handling errors in your application, we recommend:

1. Checking the HTTP status code
2. Reading the `error` message for a human-readable explanation
3. Using the `error_code` for programmatic error handling when available

## Rate Limiting

To ensure the stability and fairness of the CivicBase API, rate limits are enforced on a per-user basis.

### Rate Limit Rules

- Authenticated requests: 1000 requests per hour
- Unauthenticated requests: 60 requests per hour

### Rate Limit Headers

Rate limit information is included in the response headers of every API request:

- `X-RateLimit-Limit`: The maximum number of requests you're permitted to make per hour
- `X-RateLimit-Remaining`: The number of requests remaining in the current rate limit window
- `X-RateLimit-Reset`: The time at which the current rate limit window resets, in UTC epoch seconds

### Exceeding Rate Limits

If you exceed the rate limit, you'll receive a 429 Too Many Requests response. The response body will include a message indicating when you can retry:

```json
{
  "error": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

The `retry_after` field indicates the number of seconds until the rate limit resets.

### Best Practices

To avoid hitting rate limits:

1. Cache data when possible
2. Use bulk operations instead of many individual requests
3. Implement exponential backoff when retrying rate-limited requests

## API Versioning

CivicBase uses URL versioning to ensure backward compatibility as the API evolves.

### Version Format

The version is specified in the URL path, immediately after the API root:

```
https://api.civicbase.com/v1/
```

### Current Versions

- v1: Current stable version

### Version Lifecycle

1. New features are added to the current version if backward-compatible
2. Breaking changes trigger a new major version (e.g., v2)
3. Old versions are supported for at least 12 months after a new major version is released

### Using a Specific Version

Always specify the API version in your requests to ensure consistency:

```
GET https://api.civicbase.com/v1/users/me
```

### Version Sunset

When a version is scheduled for sunset:

1. A deprecation notice will be sent to all affected users
2. The sunset date will be announced at least 6 months in advance
3. Documentation for the sunset version will remain available, clearly marked as deprecated

### Best Practices

1. Always specify a version in your API calls
2. Subscribe to the CivicBase developer newsletter for version update notifications
3. Regularly review your integration to ensure you're using the latest recommended version

## Changelog

Major changes to the API will be documented in our changelog, available at:

```
https://api.civicbase.com/changelog
```

We recommend regularly reviewing the changelog to stay informed about new features, bug fixes, and deprecations.
# CivicBase API Documentation

# CivicBase API Documentation

## Introduction

The CivicBase API provides a flexible and powerful interface for applications to interact with the CivicBase platform. This API supports both RESTful HTTP endpoints and GraphQL queries, allowing developers to choose the most suitable approach for their application.

## Core Concepts

### Data Models
CivicBase allows applications to define custom data models. These models are flexible and can be adapted to various use cases.

### Real-time Updates
The API supports real-time updates through WebSocket connections, enabling applications to receive instant notifications about data changes.

### Authentication and Authorization
CivicBase uses JWT (JSON Web Tokens) for authentication and provides fine-grained access control mechanisms.

## API Versions

This documentation covers API v1. Always specify the API version in your requests.

Base URL: `https://api.civicbase.com/v1`

## Authentication

All API requests must be authenticated using a JWT token. Include the token in the Authorization header:
Authorization: Bearer <your_jwt_token>
Copy
To obtain a JWT token, use the authentication endpoints described in the User Management section.

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of requests. Codes in the 2xx range indicate success, codes in the 4xx range indicate an error that failed given the information provided, and codes in the 5xx range indicate an error with CivicBase's servers.

Error responses will include a JSON object with an `error` key containing a human-readable error message.

Example error response:
```json
{
  "error": "Invalid authentication token provided"
}
```

## Rate Limiting
API requests are subject to rate limiting. The current limits are:

- 1000 requests per hour for authenticated users
- 60 requests per hour for unauthenticated requests

Rate limit information is included in the response headers:

- X-RateLimit-Limit: The maximum number of requests you're permitted to make per hour.
- X-RateLimit-Remaining: The number of requests remaining in the current rate limit window.
- X-RateLimit-Reset: The time at which the current rate limit window resets in UTC epoch seconds.

If you exceed the rate limit, you'll receive a 429 Too Many Requests response.

## Endpoints

### Create User

- **URL**: `/users`
- **Method**: `POST`
- **Data Params**: 
  ```json
  {
    "username": "[string]",
    "email": "[string]"
  }

Success Response:

Code: 201
Content: { "message": "User created successfully", "user_id": [integer] }



Get Users

URL: /users
Method: GET
Success Response:

Code: 200
Content: Array of user objects



Add User Interests

URL: /users/<user_id>/interests
Method: POST
Data Params:
jsonCopy{
  "interests": "[string]"
}

Success Response:

Code: 200
Content: { "message": "Interests added successfully" }



Get Recommendations

URL: /users/<user_id>/recommendations
Method: GET
URL Params: top_n=[integer] (optional, default=5)
Success Response:

Code: 200

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
# Performance Optimization Techniques

Optimizing performance is crucial for providing a smooth user experience in applications built with CivicBase. Here are some key techniques to improve performance:

## 1. Efficient Data Querying

### Use Indexing

Properly indexed fields can significantly speed up query performance.

```javascript
// Define indexes when creating a model
cosmicSync.defineModel('UserProfile', {
  fields: { /* ... */ },
  indexes: [
    { key: { email: 1 }, unique: true },
    { key: { lastActive: -1 } }
  ]
});
```

### Optimize Query Patterns

Use selective queries to minimize data transfer.

```javascript
// Instead of fetching entire documents
const users = await cosmicSync.query('UserProfile', { age: { $gt: 18 } });

// Fetch only required fields
const userNames = await cosmicSync.query('UserProfile', 
  { age: { $gt: 18 } },
  { projection: { firstName: 1, lastName: 1 } }
);
```

## 2. Caching Strategies

Implement effective caching to reduce network requests and improve response times.

### Local Caching

```javascript
class LocalCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 60000) {
    const item = {
      value: value,
      expiry: Date.now() + ttl
    };
    this.cache.set(key, item);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}

const cache = new LocalCache();

async function getCachedData(key, fetchFunction) {
  let data = cache.get(key);
  if (!data) {
    data = await fetchFunction();
    cache.set(key, data);
  }
  return data;
}
```

### Caching in IndexedDB for Larger Datasets

For larger datasets, consider using IndexedDB for client-side storage.

```javascript
const dbPromise = idb.open('CosmicSyncCache', 1, upgradeDB => {
  upgradeDB.createObjectStore('keyval');
});

async function idbSet(key, val) {
  const db = await dbPromise;
  const tx = db.transaction('keyval', 'readwrite');
  tx.objectStore('keyval').put(val, key);
  return tx.complete;
}

async function idbGet(key) {
  const db = await dbPromise;
  return db.transaction('keyval').objectStore('keyval').get(key);
}
```

## 3. Lazy Loading

Implement lazy loading for large datasets or complex UI components.

```javascript
async function lazyLoadUserProjects(userId, page = 1, pageSize = 20) {
  const projects = await cosmicSync.query('Project', 
    { createdBy: userId },
    { 
      skip: (page - 1) * pageSize, 
      limit: pageSize,
      sort: { createdAt: -1 }
    }
  );
  return projects;
}
```

## 4. Optimistic UI Updates

Implement optimistic UI updates to improve perceived performance.

```javascript
async function updateUserProfile(userId, updates) {
  // Update UI immediately
  updateUIOptimistically(userId, updates);
  
  try {
    // Perform actual update
    await cosmicSync.updateInstance('UserProfile', userId, updates);
  } catch (error) {
    // Revert UI if update fails
    revertUIUpdate(userId);
    throw error;
  }
}
```

## 5. Efficient Data Synchronization

Optimize data sync to reduce network usage and improve sync speed.

### Delta Updates

Only sync changed fields instead of entire documents.

```javascript
function calculateDelta(oldData, newData) {
  const delta = {};
  for (const [key, value] of Object.entries(newData)) {
    if (oldData[key] !== value) {
      delta[key] = value;
    }
  }
  return delta;
}

async function syncUserProfile(userId, newData) {
  const oldData = await cosmicSync.getInstance('UserProfile', userId);
  const delta = calculateDelta(oldData, newData);
  await cosmicSync.updateInstance('UserProfile', userId, delta);
}
```

### Batching Updates

Group multiple updates into a single network request.

```javascript
const batchUpdates = [];

function queueUpdate(modelName, instanceId, updates) {
  batchUpdates.push({ modelName, instanceId, updates });
}

async function processBatchUpdates() {
  await cosmicSync.batchUpdate(batchUpdates);
  batchUpdates.length = 0;
}

// Process batch updates every 5 seconds
setInterval(processBatchUpdates, 5000);
```

## 6. WebWorkers for Intensive Operations

Offload intensive computations to WebWorkers to keep the main thread responsive.

```javascript
// In main thread
const worker = new Worker('compute-worker.js');

worker.postMessage({ action: 'processData', data: largeDataset });

worker.onmessage = function(event) {
  console.log('Processed result:', event.data);
};

// In compute-worker.js
self.onmessage = function(event) {
  if (event.data.action === 'processData') {
    const result = performIntensiveComputation(event.data.data);
    self.postMessage(result);
  }
};
```

## 7. Performance Monitoring

Implement performance monitoring to identify bottlenecks.

```javascript
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Sync operation:', entry.name, 'Duration:', entry.duration);
  }
});

performanceObserver.observe({entryTypes: ['measure']});

async function measureSyncPerformance() {
  performance.mark('syncStart');
  await cosmicSync.sync();
  performance.mark('syncEnd');
  performance.measure('Sync Duration', 'syncStart', 'syncEnd');
}
```

By implementing these performance optimization techniques, you can significantly improve the efficiency and responsiveness of your CivicBase-based application.
# Real-time Updates and Querying

## Real-time Updates

CivicBase provides real-time updates through WebSocket connections, allowing applications to receive instant notifications about data changes.

### Establishing a WebSocket Connection

- **URL**: `wss://api.civicbase.com/v1/realtime`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`

Once connected, you can subscribe to specific data models or instances to receive real-time updates.

### Subscribing to Updates

To subscribe to updates, send a JSON message through the WebSocket connection:

```json
{
  "action": "subscribe",
  "model": "Task",
  "instance_id": "task_instance_67890"  // Optional, omit to subscribe to all instances of the model
}
```

### Receiving Updates

You'll receive JSON messages for any changes to the subscribed data:

```json
{
  "event": "update",
  "model": "Task",
  "instance_id": "task_instance_67890",
  "data": {
    // Updated instance data
  }
}
```

### Unsubscribing

To unsubscribe, send a JSON message:

```json
{
  "action": "unsubscribe",
  "model": "Task",
  "instance_id": "task_instance_67890"  // Optional, omit to unsubscribe from all instances of the model
}
```

## Advanced Querying

CivicBase provides powerful querying capabilities to filter, sort, and aggregate data.

### Filtering

Use query parameters to filter data when listing instances:

- **URL**: `/data/<model_id>?filter=<filter_expression>`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`

Filter expression syntax:
- `field_name:operator:value`
- Multiple filters can be combined with `,` for AND, `|` for OR

Supported operators:
- `eq`: Equal to
- `ne`: Not equal to
- `gt`: Greater than
- `gte`: Greater than or equal to
- `lt`: Less than
- `lte`: Less than or equal to
- `in`: In a list of values
- `nin`: Not in a list of values
- `like`: String matching (use `%` as wildcard)

Example:
```
/data/Task?filter=status:eq:TODO,due_date:lt:2023-12-31
```

### Sorting

Use the `sort` and `order` query parameters:

- `sort`: Field to sort by
- `order`: `asc` for ascending, `desc` for descending

Example:
```
/data/Task?sort=due_date&order=asc
```

### Pagination

Use `page` and `per_page` query parameters for pagination:

Example:
```
/data/Task?page=2&per_page=50
```

### Aggregation

Perform aggregation operations using the `/aggregate` endpoint:

- **URL**: `/data/<model_id>/aggregate`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body**:
  ```json
  {
    "group_by": ["status"],
    "aggregations": [
      {
        "field": "id",
        "operation": "count",
        "alias": "task_count"
      }
    ],
    "filter": "due_date:gte:2023-01-01"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    [
      {
        "status": "TODO",
        "task_count": 15
      },
      {
        "status": "IN_PROGRESS",
        "task_count": 7
      },
      {
        "status": "DONE",
        "task_count": 23
      }
    ]
    ```

Supported aggregation operations:
- `count`
- `sum`
- `avg`
- `min`
- `max`

### GraphQL Support

For more complex queries, CivicBase also supports GraphQL:

- **URL**: `/graphql`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <your_jwt_token>`
- **Body**:
  ```json
  {
    "query": "query { tasks(filter: { status: TODO }, sort: { field: due_date, order: ASC }) { id title status due_date } }"
  }
  ```

Refer to the GraphQL schema documentation for full details on available queries and mutations.
# User Management and Authentication

## User Registration

To create a new user account:

- **URL**: `/auth/register`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "username": "johndoe",
    "application_id": "app_12345"
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: 
    ```json
    {
      "message": "User registered successfully",
      "user_id": "user_67890"
    }
    ```

Note: The `application_id` field is used to associate the user with a specific application using CivicBase.

## User Authentication

To authenticate a user and receive a JWT token:

- **URL**: `/auth/login`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "application_id": "app_12345"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
    ```

## Token Refresh

To refresh an expired JWT token:

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <expired_token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
    ```

## User Profile Management

### Retrieve User Profile

- **URL**: `/users/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: JSON object with user profile information

### Update User Profile

- **URL**: `/users/me`
- **Method**: `PUT`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**: JSON object with fields to update
- **Success Response**:
  - **Code**: 200
  - **Content**: Updated user profile information

## Application-specific User Data

CivicBase allows applications to store custom user data:

### Set Custom User Data

- **URL**: `/users/me/data`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "key": "preferences",
    "value": {
      "theme": "dark",
      "notifications": true
    }
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "message": "Custom data stored successfully"
    }
    ```

### Get Custom User Data

- **URL**: `/users/me/data/<key>`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: JSON object with the stored custom data

## User Permissions and Roles

CivicBase supports a flexible role-based access control (RBAC) system:

### Assign Role to User

- **URL**: `/users/<user_id>/roles`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <admin_token>`
- **Body**:
  ```json
  {
    "role": "editor",
    "application_id": "app_12345"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "message": "Role assigned successfully"
    }
    ```

### Check User Permissions

- **URL**: `/users/me/permissions`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters**:
  - `action`: The action to check (e.g., "read", "write", "delete")
  - `resource`: The resource to check permissions for (e.g., "Task", "Project")
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "permitted": true
    }
    ```

## Multi-factor Authentication (MFA)

CivicBase supports multi-factor authentication for enhanced security:

### Enable MFA

- **URL**: `/auth/mfa/enable`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "secret": "JBSWY3DPEHPK3PXP",
      "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    }
    ```

### Verify MFA

- **URL**: `/auth/mfa/verify`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "code": "123456"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "message": "MFA verified successfully"
    }
    ```

Remember to handle errors appropriately and provide clear error messages to users when authentication or authorization fails.
# Webhooks and Real-time Notifications

CivicBase provides robust support for webhooks and real-time notifications, allowing your application to receive instant updates about relevant events.

## Webhook Setup

### Registering a Webhook

- **URL**: `/webhooks`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer <your_token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "url": "https://your-app.com/webhook-endpoint",
    "events": ["user.created", "data.updated", "project.status_changed"],
    "secret": "your_webhook_secret"
  }
  ```

### Supported Events

- `user.created`: Triggered when a new user is created
- `user.updated`: Triggered when a user profile is updated
- `data.created`: Triggered when new data is created (for any model)
- `data.updated`: Triggered when data is updated (for any model)
- `data.deleted`: Triggered when data is deleted (for any model)
- `project.status_changed`: Triggered when a project's status changes (specific to MindSpheres)

You can also subscribe to model-specific events using the format `model_name.event`, e.g., `UserProfile.updated`.

## Webhook Payload

When an event occurs, CivicBase sends a POST request to your specified URL with a payload:

```json
{
  "event": "data.updated",
  "model": "UserProfile",
  "instanceId": "profile_123",
  "changes": {
    "interests": ["hiking", "photography"]
  },
  "timestamp": 1632150985,
  "signature": "sha256=..."
}
```

## Webhook Security

### Payload Signature Verification

To ensure the webhook payload hasn't been tampered with, verify the signature:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Best Practices

1. Use HTTPS for your webhook endpoint
2. Rotate your webhook secret periodically
3. Implement retry logic for failed webhook deliveries
4. Set up monitoring for your webhook endpoint

## Real-time Notifications via WebSocket

For real-time updates, CivicBase also provides a WebSocket API.

### Establishing a WebSocket Connection

```javascript
const socket = new WebSocket('wss://api.civicbase.com/v1/realtime');

socket.onopen = () => {
  console.log('Connected to CivicBase realtime API');
  socket.send(JSON.stringify({
    type: 'authenticate',
    token: 'your_auth_token'
  }));
};
```

### Subscribing to Events

```javascript
socket.send(JSON.stringify({
  type: 'subscribe',
  models: ['UserProfile', 'Project'],
  events: ['updated', 'deleted']
}));
```

### Handling Real-time Updates

```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'update':
      handleUpdate(data.model, data.instanceId, data.changes);
      break;
    case 'delete':
      handleDelete(data.model, data.instanceId);
      break;
  }
};
```

## Best Practices for Real-time Integration

1. Implement reconnection logic for WebSocket disconnects
2. Use webhooks for critical updates and WebSockets for real-time UI updates
3. Handle potential duplicate events (an update might come through both webhook and WebSocket)
4. Implement proper error handling and logging for both webhooks and WebSocket connections

By leveraging both webhooks and real-time WebSocket notifications, your application can provide a highly responsive and up-to-date experience for users.

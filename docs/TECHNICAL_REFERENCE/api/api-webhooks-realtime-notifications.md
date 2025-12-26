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

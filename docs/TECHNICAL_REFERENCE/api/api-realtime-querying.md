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

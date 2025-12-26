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

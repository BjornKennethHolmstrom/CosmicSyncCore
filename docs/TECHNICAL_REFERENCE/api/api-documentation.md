# CivicBase API Documentation

## API Version: v1

This document outlines the API endpoints for CivicBase.

## Authentication

All API requests must be authenticated using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a JWT token, use the login endpoint.

## Endpoints

### Login

Authenticate a user and receive a JWT token.

- **URL**: `/api/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "userId": "user_id_here"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "token": "your_jwt_token_here"
    }
    ```

### Set Data

Store or update data.

- **URL**: `/api/data`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token>`
- **Body**:
  ```json
  {
    "key": "your_key_here",
    "value": "your_value_here"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "message": "Data synced successfully"
    }
    ```

### Get Data

Retrieve stored data.

- **URL**: `/api/data/:key`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "data": "your_data_here"
    }
    ```

### Upload File

Upload a file to the system.

- **URL**: `/api/file`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token>`
  - `Content-Type: multipart/form-data`
- **Body**: 
  - `file`: The file to upload
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "cid": "content_identifier_here"
    }
    ```

### Get File

Retrieve a file by its Content Identifier (CID).

- **URL**: `/api/file/:cid`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token>`
- **Success Response**:
  - **Code**: 200
  - **Content**: The requested file

## WebSocket API

Real-time updates are available through WebSocket connections.

- **URL**: `ws://your-server-url/websocket?token=your_jwt_token`

### Events

- `dataSynced`: Emitted when data is synced
- `fileSynced`: Emitted when a file is synced

## Error Responses

All endpoints may return the following error responses:

- **401 Unauthorized**: 
  ```json
  {
    "error": "Invalid token"
  }
  ```
- **500 Internal Server Error**: 
  ```json
  {
    "error": "Internal server error message"
  }
  ```

## Rate Limiting

API requests are subject to rate limiting. Current limits are:
- 1000 requests per hour for authenticated users
- 60 requests per hour for unauthenticated requests

## API Versioning

The current API version is v1. Include the version in the URL for all requests:

```
https://your-server-url/api/v1/endpoint
```

Future versions will be announced and documented separately.
```


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

Note: The `application_id` field is used to associate the user with a specific application using CosmicSyncCore.

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

CosmicSyncCore allows applications to store custom user data:

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

CosmicSyncCore supports a flexible role-based access control (RBAC) system:

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

CosmicSyncCore supports multi-factor authentication for enhanced security:

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

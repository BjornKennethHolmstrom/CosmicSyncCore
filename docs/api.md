# CosmicSyncCore API Documentation

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


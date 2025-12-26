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

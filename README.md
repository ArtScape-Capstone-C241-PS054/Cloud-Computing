# Cloud-Computing

This repo contains stuff for backend API configurations



## API Reference

#### POST User

```http
  POST {{url}}/api/auth/google
```

#### GET,PUT,DELETE Pengguna
```http
  GET {{url}}/api/user/{id}
```
```http
  PUT {{url}}/api/user/{id}
```
```http
  DELETE {{url}}/api/user/{id}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `idToken` | `string` | **Required**.|
| `name` | `string` | **Required**.|
| `address` | `string` | **Required**.|
| `description` | `string` | **Required**.|
| `interest` | `string` | **Required**.|

- success return body (register for new user)
```
{
    "message": "User registered successfully",
    "uid": "uid based from auth"
}
```
- success return body (login)
```
{
    "message": "User login successful",
    "uid": "uid based from auth"
}
```

- error return body (need data for new user to input)
```
{
    "error": "Additional data required for new users"
}
```
- error return body (401)
```
{
    "error": "Unauthorized",
    "details": ""
}
```
----
#### POST ArtWork

```http
  POST {{url}}/api/artwork/add
```

#### GET,PUT,DELETE artwork
```http
  GET {{url}}/api/artwork/{id}
```
```http
  PUT {{url}}/api/artwork/{id}
```
```http
  DELETE {{url}}/api/artwork/{id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `file` | `picture` | **Required**.|
| `title` | `string` | **Required**.|
| `description` | `string` | **Required**.|
| `media` | `string` | **Required**.|
| `genre` | `string` | **Required**.|
| `price` | `number` | **Required**.|
| `yearCreated` | `number` | **Required**.|
| `artistId` | `string` | **Required**.|

- success return body
```
{
    "message": "Artwork added successfully",
    "id": "random id will generate"
}
```

- error return body
```
{
    "error": "Error adding artwork",
    "details": "Value for argument \"documentPath\" is not a valid resource path. Path must be a non-empty string."
}
```
---
#### POST Transaction
```http
  POST {{url}}/api/transaction/add
```

#### GET,PUT,DELETE artwork
```http
  GET {{url}}/api/transaction/{id}
```
```http
  PUT {{url}}/api/transaction/{id}
```
```http
  DELETE {{url}}/api/transaction/{id}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `artworkId` | `string` | **Required**.|
| `buyerId` | `string` | **Required**.|
| `artistId` | `string` | **Required**.|
| `price` | `number` | **Required**.|

- success return body
```
{
    "message": "Transaction added successfully",
    "id": "random id will generate"
}
```

- error return body
```
{
    "error": "Error adding transaction",
    "details": "Value for argument \"documentPath\" is not a valid resource path. Path must be a non-empty string."
}
```

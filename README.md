# Cloud-Computing

This repo contains stuff for backend API configurations


## API Reference

#### POST Pengguna

```http
  POST {{url}}/api/pengguna/add
```

#### GET,PUT,DELETE Pengguna
```http
  GET {{url}}/api/pengguna/{id}
```
```http
  PUT {{url}}/api/pengguna/{id}
```
```http
  DELETE {{url}}/api/pengguna/{id}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `nama` | `string` | **Required**.|
| `email` | `string` | **Required**.|
| `deskripsi` | `string` | **Required**.|
| `minat` | `string` | **Required**.|

- success return body
```
{
    "message": "Pengguna added successfully",
    "id": "random ID will generate"
}
```

- error return body
```
{
    "error": "Error adding pengguna",
    "details": "Value for argument \"data\" is not a valid Firestore document. Cannot use \"undefined\" as a Firestore value (found in field \"minat\"). If you want to ignore undefined values, enable `ignoreUndefinedProperties`."
}
```
----
#### POST Karya Seni

```http
  POST {{url}}/api/karyaSeni/add
```

#### GET,PUT,DELETE Karya Seni
```http
  GET {{url}}/api/karyaSeni/{id}
```
```http
  PUT {{url}}/api/karyaSeni/{id}
```
```http
  DELETE {{url}}/api/karyaSeni/{id}
```
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `judul` | `string` | **Required**.|
| `deskripsi` | `string` | **Required**.|
| `media` | `string` | **Required**.|
| `genre` | `string` | **Required**.|
| `harga` | `number` | **Required**.|
| `tahunBuat` | `number` | **Required**.|
| `idSeniman` | `string` | **Required**.|
| `keterangan` | `string` | **Required**.|

- success return body
```
{
    "message": "Karya seni added successfully",
    "id": "random Id will generate"
}
```

- error return body
```
{
    "error": "Error adding karya seni",
    "details": "Value for argument \"documentPath\" is not a valid resource path. Path must be a non-empty string."
}
```

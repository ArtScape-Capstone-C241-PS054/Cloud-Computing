
# API Reference

API untuk Genre Classification



URL API

```bash
 https://genre-classification-api-ludpnm2hga-et.a.run.app
```



#### Post

```http
  POST /URL/predict_recommend
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `file` | `file` |required |

#### Contoh output jika berhasil





```bash
 {
    "predictions": [
        {
            "class": "Pop",
            "probability": 0.9005333781242371
        },
        {
            "class": "Fauvism",
            "probability": 0.0388907715678215
        },
        {
            "class": "Cubism",
            "probability": 0.03651917353272438
        }
    ]
}

```


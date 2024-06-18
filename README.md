
# API Reference

API untuk Recommendation



#### Post

```http
  POST /URL/recommend_art
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `ratings` | `array` |required |
| `num_recommendations` | `number` |required |


#### contoh penggunaannya dengan JSON

```bash
{
  "ratings": [["Dadaism", 5], ["Pop", 2]],
  "num_recommendations": 6
}

`````
#### contoh jika sukses

```bash
{
    "recommendations": [
        "Dadaism",
        "Pop",
        "Cubism",
        "Surrealism",
        "Realism",
        "Impressionism"
    ]
}

````
#### contoh jika gagal/error

```bash
{
    "error": "An error occurred during recommendation"
}


````
Catatan :

- ratings : nama aliran diikuti rating. semakin tinggi rating maka semakin diprioritaskan/direkomendasikan
- num_recommendations : jumlah aliran karya seni yang ingin direkomendasikan





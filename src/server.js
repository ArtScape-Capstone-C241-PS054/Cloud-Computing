// src/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT;
const host_url = process.env.HOST_URL;
const app = express();
app.use(bodyParser.json());

const authRoutes = require('./routes/authRoutes'); // Import authRoutes
const penggunaRoutes = require('./routes/penggunaRoutes');
const karyaSeniRoutes = require('./routes/karyaSeniRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
// const rekomendasiRoutes = require('./routes/rekomendasiRoutes');

app.use('/api/auth',authRoutes); // Use authRoutes
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/karyaSeni', karyaSeniRoutes);
app.use('/api/transaksi', transaksiRoutes);
// app.use('/api/rekomendasi', rekomendasiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${host_url}`);
});

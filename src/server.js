// src/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT;
const host_url = process.env.HOST_URL;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes'); // Import authRoutes
const userRoutes = require('./routes/userRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
// const rekomendasiRoutes = require('./routes/rekomendasiRoutes');

app.use('/api/auth',authRoutes); // Use authRoutes
app.use('/api/user', userRoutes);
app.use('/api/artwork', artworkRoutes);
app.use('/api/transaction', transactionRoutes);
// app.use('/api/rekomendasi', rekomendasiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${host_url}`);
});

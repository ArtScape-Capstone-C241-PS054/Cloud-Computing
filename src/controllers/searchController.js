// src/controllers/searchController.js
const firestore = require('../config/firestore');

exports.search = async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        res.status(400).send({ error: 'Keyword query parameter is required' });
        return;
    }

    try {
        // Cari dalam koleksi Artwork
        const artworkSnapshot = await firestore.collection('Artwork').get();
        const artworks = artworkSnapshot.docs
            .filter(doc => {
                const data = doc.data();
                return (
                    data.title.toLowerCase().includes(keyword.toLowerCase()) ||
                    data.genre.toLowerCase().includes(keyword.toLowerCase()) ||
                    data.yearCreated.toString().includes(keyword)
                );
            })
            .map(doc => {
                const {
                    title,
                    photo,
                    description,
                    media,
                    genre,
                    price,
                    yearCreated,
                    artistId,
                    availability
                } = doc.data();
                return {
                    id: doc.id,
                    photo: photo,
                    title,
                    description,
                    media,
                    genre,
                    price,
                    yearCreated,
                    artistId,
                    availability
                };
            });

        // Cari dalam koleksi User
        const userSnapshot = await firestore.collection('User').get();
        const users = userSnapshot.docs
            .filter(doc => {
                const data = doc.data();
                return data.name.toLowerCase().includes(keyword.toLowerCase());
            })
            .map(doc => {
                const {
                    name,
                    email,
                    address,
                    picture,
                    description,
                    interest,
                    lastLogin,
                    phoneNumber
                } = doc.data();
                return {
                    id: doc.id,
                    name,
                    email,
                    address,
                    picture,
                    description,
                    interest,
                    lastLogin,
                    phoneNumber
                };
            });

        // Cek apakah ada hasil dari pencarian
        if (artworks.length === 0 && users.length === 0) {
            res.status(404).send({ error: 'No data found matching the keyword' });
            return;
        }

        res.status(200).send({ artworks, users });
    } catch (error) {
        console.error('Error searching data:', error);
        res.status(500).send({ error: 'Error searching data', details: error.message });
    }
};

const firestore = require('../config/firestore');
const bucket = require('../config/cloud-storage');

// Menggunakan `import()` dinamis untuk `nanoid`
let nanoid;
(async () => {
    const { nanoid: _nanoid } = await import('nanoid');
    nanoid = _nanoid;
})();

exports.addArtwork = async (req, res) => {
    try {
        const {
            title,
            description,
            media,
            genre,
            price,
            yearCreated,
            artistId,
        } = req.body;

        // Validate that none of the fields are undefined
        if (title === undefined || description === undefined || media === undefined || genre === undefined || price === undefined || yearCreated === undefined || artistId === undefined) {
            res.status(400).send({ error: 'Some fields are undefined' });
            return;
        }

        // Validate the existence of artistId
        const artistDoc = await firestore.collection('User').doc(artistId).get();
        if (!artistDoc.exists) {
            res.status(404).send({ error: 'Artist not found' });
            return;
        }

        // Validate that price is a number
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice)) {
            res.status(400).send({ error: 'Price must be a number' });
            return;
        }

        // Validate that yearCreated is a valid year
        const parsedYearCreated = parseInt(yearCreated, 10);
        if (isNaN(parsedYearCreated) || parsedYearCreated.toString().length !== 4) {
            res.status(400).send({ error: 'YearCreated must be a valid year' });
            return;
        }

        const file = req.file;
        if (!file) {
            res.status(400).send({ error: 'No file uploaded' });
            return;
        }

        // Generate a new artwork ID with length 7 using nanoid
        const artworkId = nanoid(7);

        // Save the file in a folder named after the artist ID
        const blob = bucket.file(`${artistId}/${file.originalname}`);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('error', (err) => {
            res.status(500).send({ error: 'Error uploading file', details: err.message });
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const artworkRef = firestore.collection('Artwork').doc(artworkId);

            await artworkRef.set({
                title,
                description,
                media,
                genre,
                price: parsedPrice,
                yearCreated: parsedYearCreated,
                artworkImage: publicUrl,
                artistId,
                availability: true // Set availability to true by default
            });

            // Save artist data in sub-collection
            await artworkRef.collection('Artist').doc(artistId).set(artistDoc.data());

            res.status(200).send({ message: 'Artwork added successfully', id: artworkId });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(413).send({ error: 'File size exceeds limit' });
        } else {
            res.status(500).send({ error: 'Error adding artwork', details: error.message });
        }
    }
};

// Get Artwork
exports.getArtwork = async (req, res) => {
    try {
        const id = req.params.id;
        const artworkRef = firestore.collection('Artwork').doc(id);
        const doc = await artworkRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'Artwork not found' });
        } else {
            res.status(200).send(doc.data());
        }
    } catch (error) {
        res.status(500).send({ error: 'Error getting artwork', details: error.message });
    }
};

// Function to get all artwork data
exports.getAllArtworkData = async (req, res) => {
    try {
        const artworkSnapshot = await firestore.collection('Artwork').get();
        const artworks = artworkSnapshot.docs.map(doc => {
            const { artworkImage, title, description, media, genre, price, yearCreated, artistId, availability } = doc.data();
            return {
                id: doc.id,
                file: artworkImage,
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

        res.status(200).send(artworks);
    } catch (error) {
        console.error('Error getting all artworks:', error);
        res.status(500).send({ error: 'Error getting all artworks', details: error.message });
    }
};

// Update Artwork
exports.updateArtwork = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, media, genre, price, yearCreated, artistId, availability } = req.body;

        const artworkRef = firestore.collection('Artwork').doc(id);

        const doc = await artworkRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Artwork not found' });
            return;
        }

        await artworkRef.update({
            title,
            description,
            media,
            genre,
            price,
            yearCreated,
            artistId,
            availability,
        });

        res.status(200).send({ message: 'Artwork updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating artwork', details: error.message });
    }
};

// Function to delete sub-collections
// Function to delete sub-collections
const deleteCollection = async (collectionRef, batchSize) => {
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, batchSize, resolve, reject);
    });
};

const deleteQueryBatch = (query, batchSize, resolve, reject) => {
    query.get()
        .then((snapshot) => {
            if (snapshot.size === 0) {
                return 0;
            }

            const batch = firestore.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            return batch.commit().then(() => snapshot.size);
        })
        .then((numDeleted) => {
            if (numDeleted === 0) {
                resolve();
                return;
            }

            process.nextTick(() => {
                deleteQueryBatch(query, batchSize, resolve, reject);
            });
        })
        .catch(reject);
};

// Delete Artwork
exports.deleteArtwork = async (req, res) => {
    try {
        const id = req.params.id;
        const artworkRef = firestore.collection('Artwork').doc(id);

        const doc = await artworkRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Artwork not found' });
            return;
        }

        // Delete image from Cloud Storage
        const artworkImage = doc.data().artworkImage;
        if (artworkImage) {
            const fileName = decodeURIComponent(artworkImage.split('/').pop());
            const file = bucket.file(`${doc.data().artistId}/${fileName}`);
            await file.delete().catch(err => console.error('Failed to delete file from Cloud Storage', err));
        }

        // Delete reference from Artist
        const artistId = doc.data().artistId;
        if (artistId) {
            const artistRef = firestore.collection('User').doc(artistId);
            const artistDoc = await artistRef.get();
            if (artistDoc.exists) {
                const artworkSubRef = artistRef.collection('Artwork').doc(id);
                await artworkSubRef.delete().catch(err => console.error('Failed to delete sub-collection document from Artist', err));
            }
        }

        // Delete reference from Buyer
        const buyerId = doc.data().buyerId;
        if (buyerId) {
            const buyerRef = firestore.collection('User').doc(buyerId);
            const buyerDoc = await buyerRef.get();
            if (buyerDoc.exists) {
                const buyerSubRef = buyerRef.collection('Buyer').doc(id);
                await buyerSubRef.delete().catch(err => console.error('Failed to delete sub-collection document from Buyer', err));
            }
        }

        // Delete sub-collection Artist
        const artistSubCollectionRef = artworkRef.collection('Artist');
        await deleteCollection(artistSubCollectionRef, 10);

        // Delete references to this artwork from transactions
        const transactionRefs = await firestore.collection('Transaction').where('artworkId', '==', id).get();
        const deletePromises = transactionRefs.docs.map(async (transactionDoc) => {
            await transactionDoc.ref.delete();
        });
        await Promise.all(deletePromises);

        // Delete artwork
        await artworkRef.delete();

        res.status(200).send({ message: 'Artwork deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting artwork', details: error.message });
    }
};
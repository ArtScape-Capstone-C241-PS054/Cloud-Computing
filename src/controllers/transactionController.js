const firestore = require('../config/firestore');
const admin = require('firebase-admin');

// Add Transaction
exports.addTransaction = async (req, res) => {
    try {
        const { artworkId, buyerId, artistId, price } = req.body;

        // Validate input fields
        if (!artworkId || !buyerId || !artistId || !price) {
            res.status(400).send({ error: 'All fields are required' });
            return;
        }

        // Check if artwork exists and is available
        const artworkDoc = await firestore.collection('Artwork').doc(artworkId).get();
        if (!artworkDoc.exists) {
            res.status(404).send({ error: 'Artwork not found' });
            return;
        }

        const artworkData = artworkDoc.data();
        if (!artworkData.availability) {
            res.status(400).send({ error: 'Artwork is not available' });
            return;
        }

        // Check if buyer exists
        const buyerDoc = await firestore.collection('User').doc(buyerId).get();
        if (!buyerDoc.exists) {
            res.status(404).send({ error: 'Buyer not found' });
            return;
        }

        // Check if artist exists
        const artistDoc = await firestore.collection('User').doc(artistId).get();
        if (!artistDoc.exists) {
            res.status(404).send({ error: 'Artist not found' });
            return;
        }

        // Get current server timestamp
        const transactionDate = admin.firestore.Timestamp.now();

        // Import nanoid dynamically and generate a new transaction ID with length 7
        const { nanoid } = await import('nanoid');
        const transactionId = nanoid(7);

        // Create transaction
        const transactionRef = firestore.collection('Transaction').doc(transactionId);
        await transactionRef.set({
            artworkId,
            buyerId,
            artistId,
            transactionDate,
            price
        });

        // Add sub-collections
        await transactionRef.collection('Artwork').doc(artworkId).set(artworkDoc.data());
        await transactionRef.collection('Buyer').doc(buyerId).set(buyerDoc.data());
        await transactionRef.collection('Artist').doc(artistId).set(artistDoc.data());

        // Update artwork availability
        await firestore.collection('Artwork').doc(artworkId).update({ availability: false });

        res.status(200).send({ message: 'Transaction added successfully', id: transactionId });
    } catch (error) {
        res.status(500).send({ error: 'Error adding transaction', details: error.message });
    }
};

// Get Transaction
exports.getTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const transactionRef = firestore.collection('Transaction').doc(id);
        const doc = await transactionRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'Transaction not found' });
            return;
        }

        res.status(200).send(doc.data());
    } catch (error) {
        res.status(500).send({ error: 'Error getting transaction', details: error.message });
    }
};

// Get All Transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactionsRef = firestore.collection('Transaction');
        const snapshot = await transactionsRef.get();

        const transactions = [];
        snapshot.forEach(doc => {
            const transactionData = doc.data();
            transactions.push({
                id: doc.id,
                artworkId: transactionData.artworkId,
                buyerId: transactionData.buyerId,
                artistId: transactionData.artistId,
                price: transactionData.price,
                transactionDate: transactionData.transactionDate.toDate() // Convert Firestore Timestamp to Date object
            });
        });

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send({ error: 'Error getting transactions', details: error.message });
    }
};

// Update Transaction
exports.updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const { artworkId, buyerId, artistId, price } = req.body;

        const transactionRef = firestore.collection('Transaction').doc(id);
        const doc = await transactionRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Transaction not found' });
            return;
        }

        // Update transaction
        await transactionRef.update({
            artworkId,
            buyerId,
            artistId,
            price
        });

        // Update sub-collections
        if (artworkId) {
            const artworkDoc = await firestore.collection('Artwork').doc(artworkId).get();
            await transactionRef.collection('Artwork').doc(artworkId).set(artworkDoc.data());
        }
        if (buyerId) {
            const buyerDoc = await firestore.collection('User').doc(buyerId).get();
            await transactionRef.collection('Buyer').doc(buyerId).set(buyerDoc.data());
        }
        if (artistId) {
            const artistDoc = await firestore.collection('User').doc(artistId).get();
            await transactionRef.collection('Artist').doc(artistId).set(artistDoc.data());
        }

        res.status(200).send({ message: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating transaction', details: error.message });
    }
};

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

// Delete Transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const transactionRef = firestore.collection('Transaction').doc(id);
        const doc = await transactionRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Transaction not found' });
            return;
        }

        // Get sub-collection references
        const artworkSubCollectionRef = transactionRef.collection('Artwork');
        const buyerSubCollectionRef = transactionRef.collection('Buyer');
        const artistSubCollectionRef = transactionRef.collection('Artist');

        // Delete sub-collections
        await deleteCollection(artworkSubCollectionRef, 10);
        await deleteCollection(buyerSubCollectionRef, 10);
        await deleteCollection(artistSubCollectionRef, 10);

        // Delete transaction
        await transactionRef.delete();

        // Jika transaksi terkait dengan artwork, hapus referensi transaksi dari artwork
        const artworkId = doc.data().artworkId;
        if (artworkId) {
            const artworkRef = firestore.collection('Artwork').doc(artworkId);
            await artworkRef.update({
                transactionId: admin.firestore.FieldValue.delete()
            });
        }

        // Jika transaksi terkait dengan pembeli, hapus referensi transaksi dari pembeli
        const buyerId = doc.data().buyerId;
        if (buyerId) {
            const buyerRef = firestore.collection('User').doc(buyerId);
            await buyerRef.update({
                transactionId: admin.firestore.FieldValue.delete()
            });
        }

        // Jika transaksi terkait dengan artis, hapus referensi transaksi dari artis
        const artistId = doc.data().artistId;
        if (artistId) {
            const artistRef = firestore.collection('User').doc(artistId);
            await artistRef.update({
                transactionId: admin.firestore.FieldValue.delete()
            });
        }

        res.status(200).send({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting transaction', details: error.message });
    }
};
const firestore = require('../config/firestore');
const bucket = require('../config/cloud-storage');
const admin = require('firebase-admin');

// Function to get a user by ID
exports.getUser = async (req, res) => {
    try {
        const userRef = firestore.collection('User').doc(req.params.id);
        const doc = await userRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'User not found' });
            return;
        }

        res.status(200).send(doc.data());
    } catch (error) {
        res.status(500).send({ error: 'Error getting user', details: error.message });
    }
};

// Function to get all user data
exports.getAllUserData = async (req, res) => {
    try {
        const userSnapshot = await firestore.collection('User').get();
        const users = userSnapshot.docs.map(async doc => {
            const userData = doc.data();
            // Ambil data terakhir login jika tersedia
            let lastLogin = null;
            if (userData.lastLogin) {
                lastLogin = userData.lastLogin.toDate(); // Konversi Firestore Timestamp menjadi objek Date
            }
            const { name, address, description, interest, picture } = userData;
            return {
                id: doc.id,
                name,
                address,
                description,
                interest,
                lastLogin,
                photo: picture
            };
        });

        // Tunggu semua proses map selesai
        const userData = await Promise.all(users);
        
        res.status(200).send(userData);
    } catch (error) {
        res.status(500).send({ error: 'Error getting all users', details: error.message });
    }
};


// Function to update a user by ID
exports.updateUser = async (req, res) => {
    try {
        const userRef = firestore.collection('User').doc(req.params.id);
        await userRef.update(req.body);

        res.status(200).send({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating user', details: error.message });
    }
};

// Function to delete a user by ID
// Function to delete user and associated artworks and folders
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userRef = firestore.collection('User').doc(userId);

        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Fetch all Artwork documents related to this user
        const artworkSnapshot = await firestore.collection('Artwork').where('artistId', '==', userId).get();

        const deletePromises = artworkSnapshot.docs.map(async (artworkDoc) => {
            const artworkData = artworkDoc.data();

            // Delete the image from Google Cloud Storage
            const artworkImage = artworkData.artworkImage;
            if (artworkImage) {
                const fileName = artworkImage.split('/').pop();
                const file = bucket.file(`${userId}/${fileName}`);
                await file.delete();
            }

            // Delete sub-collections under the Artwork document
            const artistSubCollection = artworkDoc.ref.collection('Artist').get();
            const deleteSubPromises = (await artistSubCollection).docs.map((doc) => doc.ref.delete());
            await Promise.all(deleteSubPromises);

            // Delete the Artwork document
            return artworkDoc.ref.delete();
        });

        // Execute all deletion promises
        await Promise.all(deletePromises);

        // Delete the user's folder from Cloud Storage
        const [files] = await bucket.getFiles({ prefix: `${userId}/` });
        if (files.length > 0) {
            const deleteFilePromises = files.map(file => file.delete());
            await Promise.all(deleteFilePromises);
        }

        // Delete the user document
        await userRef.delete();

        res.status(200).send({ message: 'User and related Artwork deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting user', details: error.message });
    }
};
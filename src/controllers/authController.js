// src/controllers/authController.js
const { admin, firestore } = require('../config/firestore');

exports.googleAuth = async (req, res) => {
    const idToken = req.body.idToken;
    const userName = req.body.name; // Nama pengguna yang diisi jika pertama kali masuk

    if (!idToken) {
        return res.status(400).send({ error: 'ID token is required' });
    }

    try {
        // Verifikasi ID token menggunakan Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Mendapatkan informasi pengguna dari token yang telah didekode
        const { email, picture } = decodedToken;

        // Referensi ke dokumen pengguna di Firestore
        const userRef = firestore.collection('Pengguna').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            // Jika pengguna sudah ada, perbarui lastLogin dan data lainnya
            await userRef.set({
                email: email,
                picture: picture,
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            res.status(200).send({ message: 'Authentication successful', uid: uid });
        } else {
            // Jika pengguna baru, tambahkan data baru dengan nama yang diberikan
            if (!userName) {
                return res.status(400).send({ error: 'Name is required for new users' });
            }

            await userRef.set({
                email: email,
                name: userName,
                picture: picture,
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(200).send({ message: 'Authentication successful and new user added', uid: uid });
        }
    } catch (error) {
        console.error('Error verifying ID token:', error);
        res.status(401).send({ error: 'Invalid ID token', details: error.message });
    }
};

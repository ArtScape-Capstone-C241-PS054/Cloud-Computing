// src/controllers/penggunaController.js
const firestore = require('../config/firestore');
const bucket = require('../config/cloud-storage');

// Fungsi untuk menambahkan pengguna dengan ID acak
exports.addPengguna = async (req, res) => {
    try {
        const { nama, email, deskripsi, minat } = req.body;

        const penggunaRef = firestore.collection('Pengguna').doc();
        const id = penggunaRef.id; // ID yang dihasilkan secara otomatis

        await penggunaRef.set({
            nama,
            email,
            deskripsi,
            minat
        });

        res.status(200).send({ message: 'Pengguna added successfully', id });
    } catch (error) {
        res.status(500).send({ error: 'Error adding pengguna', details: error.message });
    }
};

// Fungsi untuk mendapatkan pengguna berdasarkan ID
exports.getPengguna = async (req, res) => {
    try {
        const penggunaRef = firestore.collection('Pengguna').doc(req.params.id);
        const doc = await penggunaRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'Pengguna not found' });
            return;
        }

        res.status(200).send(doc.data());
    } catch (error) {
        res.status(500).send({ error: 'Error getting pengguna', details: error.message });
    }
};

// Fungsi untuk memperbarui pengguna berdasarkan ID
exports.updatePengguna = async (req, res) => {
    try {
        const penggunaRef = firestore.collection('Pengguna').doc(req.params.id);
        await penggunaRef.update(req.body);

        res.status(200).send({ message: 'Pengguna updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating pengguna', details: error.message });
    }
};

// Fungsi untuk menghapus pengguna berdasarkan ID
exports.deletePengguna = async (req, res) => {
    try {
        const penggunaId = req.params.id;

        const penggunaRef = firestore.collection('Pengguna').doc(penggunaId);
        const penggunaDoc = await penggunaRef.get();

        if (!penggunaDoc.exists) {
            return res.status(404).send({ error: 'Pengguna not found' });
        }

        // Fetch all Karya Seni documents related to this user
        const karyaSeniSnapshot = await firestore.collection('KaryaSeni').where('idSeniman', '==', penggunaId).get();
        
        const deletePromises = karyaSeniSnapshot.docs.map(async (karyaSeniDoc) => {
            const karyaSeniData = karyaSeniDoc.data();
            
            // Delete the image from Google Cloud Storage
            const fotoKaryaSeni = karyaSeniData.fotoKaryaSeni;
            if (fotoKaryaSeni) {
                const fileName = fotoKaryaSeni.split('/').pop();
                const file = bucket.file(fileName);
                await file.delete();
            }
            
            // Delete sub-collections under the Karya Seni document
            const senimanSubCollection = karyaSeniDoc.ref.collection('Seniman').get();
            const deleteSubPromises = (await senimanSubCollection).docs.map((doc) => doc.ref.delete());
            await Promise.all(deleteSubPromises);
            
            // Delete the Karya Seni document
            return karyaSeniDoc.ref.delete();
        });

        // Execute all deletion promises
        await Promise.all(deletePromises);

        // Delete the user document
        await penggunaRef.delete();

        res.status(200).send({ message: 'Pengguna and related Karya Seni deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting pengguna', details: error.message });
    }
};

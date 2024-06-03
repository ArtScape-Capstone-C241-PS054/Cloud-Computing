const firestore = require('../config/firestore');
const bucket = require('../config/cloud-storage');

exports.addKaryaSeni = async (req, res) => {
    try {
        const {
            judul,
            deskripsi,
            media,
            genre,
            harga,
            tahunBuat,
            idSeniman,
            keterangan,
        } = req.body;

        // Verifikasi bahwa semua nilai tidak undefined
        if (judul === undefined || deskripsi === undefined || media === undefined || genre === undefined || harga === undefined || tahunBuat === undefined || idSeniman === undefined || keterangan === undefined) {
            res.status(400).send({ error: 'Some fields are undefined' });
            return;
        }

        // Verifikasi keberadaan idSeniman
        const senimanDoc = await firestore.collection('Pengguna').doc(idSeniman).get();
        if (!senimanDoc.exists) {
            res.status(404).send({ error: 'Seniman not found' });
            return;
        }

        const file = req.file;
        if (!file) {
            res.status(400).send({ error: 'No file uploaded' });
            return;
        }

        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('error', (err) => {
            res.status(500).send({ error: 'Error uploading file', details: err.message });
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const karyaSeniRef = firestore.collection('KaryaSeni').doc();
            const id = karyaSeniRef.id;

            await karyaSeniRef.set({
                judul,
                deskripsi,
                media,
                genre,
                harga,
                tahunBuat,
                fotoKaryaSeni: publicUrl,
                idSeniman,
                keterangan
            });

            // Simpan data Seniman dalam subkoleksi
            await karyaSeniRef.collection('Seniman').doc(idSeniman).set(senimanDoc.data());

            res.status(200).send({ message: 'Karya seni added successfully', id });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(413).send({ error: 'File size exceeds limit' });
        } else {
            res.status(500).send({ error: 'Error adding karya seni', details: error.message });
        }
    }
};

// Get Karya Seni
exports.getKaryaSeni = async (req, res) => {
    try {
        const id = req.params.id;
        const karyaSeniRef = firestore.collection('KaryaSeni').doc(id);
        const doc = await karyaSeniRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'Karya seni not found' });
        } else {
            res.status(200).send(doc.data());
        }
    } catch (error) {
        res.status(500).send({ error: 'Error getting karya seni', details: error.message });
    }
};

// Update Karya Seni
exports.updateKaryaSeni = async (req, res) => {
    try {
        const id = req.params.id;
        const { judul, deskripsi, media, genre, harga, tahunBuat, idSeniman, status } = req.body;

        const karyaSeniRef = firestore.collection('KaryaSeni').doc(id);

        const doc = await karyaSeniRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Karya seni not found' });
            return;
        }

        await karyaSeniRef.update({
            judul,
            deskripsi,
            media,
            genre,
            harga,
            tahunBuat,
            idSeniman,
            keterangan,
        });

        res.status(200).send({ message: 'Karya seni updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating karya seni', details: error.message });
    }
};

// Fungsi untuk menghapus sub-koleksi
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

// Delete Karya Seni
exports.deleteKaryaSeni = async (req, res) => {
    try {
        const id = req.params.id;
        const karyaSeniRef = firestore.collection('KaryaSeni').doc(id);

        const doc = await karyaSeniRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Karya seni not found' });
            return;
        }

        // Hapus gambar dari Cloud Storage
        const fotoKaryaSeni = doc.data().fotoKaryaSeni;
        if (fotoKaryaSeni) {
            const fileName = decodeURIComponent(fotoKaryaSeni.split('/').pop());
            const file = bucket.file(fileName);
            await file.delete().catch(err => console.error('Failed to delete file from Cloud Storage', err));
        }

        // Hapus referensi dari Pengguna
        const idSeniman = doc.data().idSeniman;
        if (idSeniman) {
            const senimanRef = firestore.collection('Pengguna').doc(idSeniman);
            const senimanDoc = await senimanRef.get();
            if (senimanDoc.exists) {
                const karyaSeniSubRef = senimanRef.collection('KaryaSeni').doc(id);
                await karyaSeniSubRef.delete().catch(err => console.error('Failed to delete sub-collection document from Pengguna', err));
            }
        }

        // Hapus referensi dari Pembeli
        const idPembeli = doc.data().idPembeli;
        if (idPembeli) {
            const pembeliRef = firestore.collection('Pengguna').doc(idPembeli);
            const pembeliDoc = await pembeliRef.get();
            if (pembeliDoc.exists) {
                const pembeliSubRef = pembeliRef.collection('Pembeli').doc(id);
                await pembeliSubRef.delete().catch(err => console.error('Failed to delete sub-collection document from Pembeli', err));
            }
        }

        // Hapus sub-koleksi Seniman
        const senimanSubCollectionRef = karyaSeniRef.collection('Seniman');
        await deleteCollection(senimanSubCollectionRef, 10);

        // Hapus karya seni
        await karyaSeniRef.delete();

        res.status(200).send({ message: 'Karya seni deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting karya seni', details: error.message });
    }
};
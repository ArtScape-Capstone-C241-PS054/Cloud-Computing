const firestore = require('../config/firestore');

// Add Transaksi
exports.addTransaksi = async (req, res) => {
    try {
        const {
            idKaryaSeni,
            idPembeli,
            idSeniman,
            tanggalTransaksi,
            harga
        } = req.body;

        // Verifikasi bahwa semua nilai tidak undefined
        if (idKaryaSeni === undefined || idPembeli === undefined || idSeniman === undefined || tanggalTransaksi === undefined || harga === undefined) {
            res.status(400).send({ error: 'Some fields are undefined' });
            return;
        }

        // Periksa apakah idKaryaSeni ada dalam collection KaryaSeni
        const karyaSeniDoc = await firestore.collection('KaryaSeni').doc(idKaryaSeni).get();
        if (!karyaSeniDoc.exists) {
            res.status(404).send({ error: 'Karya seni not found' });
            return;
        }

        // Periksa apakah idPembeli ada dalam collection Pengguna
        const pembeliDoc = await firestore.collection('Pengguna').doc(idPembeli).get();
        if (!pembeliDoc.exists) {
            res.status(404).send({ error: 'Pembeli not found' });
            return;
        }

        // Periksa apakah idSeniman ada dalam collection Pengguna
        const senimanDoc = await firestore.collection('Pengguna').doc(idSeniman).get();
        if (!senimanDoc.exists) {
            res.status(404).send({ error: 'Seniman not found' });
            return;
        }

        const transaksiRef = firestore.collection('Transaksi').doc();
        const id = transaksiRef.id;

        await transaksiRef.set({
            idKaryaSeni,
            idPembeli,
            idSeniman,
            tanggalTransaksi,
            harga
        });

        // Tambahkan sub-collection KaryaSeni dengan data karya seni
        await transaksiRef.collection('KaryaSeni').doc(idKaryaSeni).set(karyaSeniDoc.data());

        // Tambahkan sub-collection Pembeli dengan data pengguna pembeli
        await transaksiRef.collection('Pembeli').doc(idPembeli).set(pembeliDoc.data());

        // Tambahkan sub-collection Seniman dengan data pengguna seniman
        await transaksiRef.collection('Seniman').doc(idSeniman).set(senimanDoc.data());

        res.status(200).send({ message: 'Transaksi added successfully', id });
    } catch (error) {
        res.status(500).send({ error: 'Error adding transaksi', details: error.message });
    }
};

// Get Transaksi
exports.getTransaksi = async (req, res) => {
    try {
        const id = req.params.id;
        const transaksiRef = firestore.collection('Transaksi').doc(id);
        const doc = await transaksiRef.get();

        if (!doc.exists) {
            res.status(404).send({ error: 'Transaksi not found' });
        } else {
            res.status(200).send(doc.data());
        }
    } catch (error) {
        res.status(500).send({ error: 'Error getting transaksi', details: error.message });
    }
};

// Update Transaksi
exports.updateTransaksi = async (req, res) => {
    try {
        const id = req.params.id;
        const { idKaryaSeni, idPembeli, idSeniman, tanggalTransaksi, harga } = req.body;

        const transaksiRef = firestore.collection('Transaksi').doc(id);

        const doc = await transaksiRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Transaksi not found' });
            return;
        }

        // Periksa apakah idKaryaSeni ada dalam collection KaryaSeni
        if (idKaryaSeni !== undefined) {
            const karyaSeniDoc = await firestore.collection('KaryaSeni').doc(idKaryaSeni).get();
            if (!karyaSeniDoc.exists) {
                res.status(404).send({ error: 'Karya seni not found' });
                return;
            }
        }

        // Periksa apakah idPembeli ada dalam collection Pengguna
        if (idPembeli !== undefined) {
            const pembeliDoc = await firestore.collection('Pengguna').doc(idPembeli).get();
            if (!pembeliDoc.exists) {
                res.status(404).send({ error: 'Pembeli not found' });
                return;
            }
        }

        // Periksa apakah idSeniman ada dalam collection Pengguna
        if (idSeniman !== undefined) {
            const senimanDoc = await firestore.collection('Pengguna').doc(idSeniman).get();
            if (!senimanDoc.exists) {
                res.status(404).send({ error: 'Seniman not found' });
                return;
            }
        }

        await transaksiRef.update({
            idKaryaSeni,
            idPembeli,
            idSeniman,
            tanggalTransaksi,
            harga
        });

        // Update sub-collection KaryaSeni jika idKaryaSeni diubah
        if (idKaryaSeni !== undefined) {
            const karyaSeniDoc = await firestore.collection('KaryaSeni').doc(idKaryaSeni).get();
            await transaksiRef.collection('KaryaSeni').doc(idKaryaSeni).set(karyaSeniDoc.data());
        }

        // Update sub-collection Pembeli jika idPembeli diubah
        if (idPembeli !== undefined) {
            const pembeliDoc = await firestore.collection('Pengguna').doc(idPembeli).get();
            await transaksiRef.collection('Pembeli').doc(idPembeli).set(pembeliDoc.data());
        }

        // Update sub-collection Seniman jika idSeniman diubah
        if (idSeniman !== undefined) {
            const senimanDoc = await firestore.collection('Pengguna').doc(idSeniman).get();
            await transaksiRef.collection('Seniman').doc(idSeniman).set(senimanDoc.data());
        }

        res.status(200).send({ message: 'Transaksi updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error updating transaksi', details: error.message });
    }
};

// Delete Transaksi
exports.deleteTransaksi = async (req, res) => {
    try {
        const id = req.params.id;
        const transaksiRef = firestore.collection('Transaksi').doc(id);

        const doc = await transaksiRef.get();
        if (!doc.exists) {
            res.status(404).send({ error: 'Transaksi not found' });
            return;
        }

        await transaksiRef.delete();

        res.status(200).send({ message: 'Transaksi deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting transaksi', details: error.message });
    }
};

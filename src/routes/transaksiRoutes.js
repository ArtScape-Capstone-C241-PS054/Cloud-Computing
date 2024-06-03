const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

router.post('/add', transaksiController.addTransaksi);
router.get('/:id', transaksiController.getTransaksi);
router.put('/:id', transaksiController.updateTransaksi);
router.delete('/:id', transaksiController.deleteTransaksi);

module.exports = router;

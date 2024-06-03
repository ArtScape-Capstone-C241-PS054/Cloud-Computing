const express = require('express');
const router = express.Router();
const karyaSeniController = require('../controllers/karyaSeniController');
const upload = require('../middleware/upload');

router.post('/add', upload.single('file'), karyaSeniController.addKaryaSeni);
router.get('/:id', karyaSeniController.getKaryaSeni);
router.put('/:id', karyaSeniController.updateKaryaSeni);
router.delete('/:id', karyaSeniController.deleteKaryaSeni);

module.exports = router;

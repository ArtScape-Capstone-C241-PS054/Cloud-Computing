const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');

router.post('/add', penggunaController.addPengguna);
// router.post('/verifyToken', penggunaController.verifyToken);
router.get('/:id', penggunaController.getPengguna);
router.put('/:id', penggunaController.updatePengguna);
router.delete('/:id', penggunaController.deletePengguna);

module.exports = router;

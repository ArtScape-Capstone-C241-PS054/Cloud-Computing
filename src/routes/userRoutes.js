const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// router.post('/add', userController.addPengguna);
// router.post('/verifyToken', penggunaController.verifyToken);
router.get('/allUser',userController.getAllUserData);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;

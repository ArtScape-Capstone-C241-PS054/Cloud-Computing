const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const upload = require('../middleware/upload');

router.post('/add', upload.single('file'), artworkController.addArtwork);
router.get('/allArtwork', artworkController.getAllArtworkData);
router.get('/:id', artworkController.getArtwork);
router.put('/:id', artworkController.updateArtwork);
router.delete('/:id', artworkController.deleteArtwork);

module.exports = router;

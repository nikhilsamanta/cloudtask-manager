const express = require('express');
const router = express.Router();
const { downloadAttachment } = require('../controllers/attachmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id/download', protect, downloadAttachment);

module.exports = router;

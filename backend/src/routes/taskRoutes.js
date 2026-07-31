const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const {
  getCommentsByTask,
  addComment,
} = require('../controllers/commentController');
const {
  uploadAttachment,
  getAttachmentsByTask,
} = require('../controllers/attachmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router
  .route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, authorize('Admin', 'Manager'), deleteTask);

router.patch('/:id/status', protect, updateTaskStatus);

// Comments nested under tasks
router
  .route('/:taskId/comments')
  .get(protect, getCommentsByTask)
  .post(protect, addComment);

// Attachments nested under tasks
router
  .route('/:taskId/attachments')
  .get(protect, getAttachmentsByTask)
  .post(protect, upload.single('file'), uploadAttachment);

module.exports = router;

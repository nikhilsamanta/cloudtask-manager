const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin', 'Manager'), createProject);

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('Admin', 'Manager'), updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

module.exports = router;

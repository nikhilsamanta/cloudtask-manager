const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
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

// Returns only the members of a project (used by TaskModal assignee dropdown)
router.get('/:id/members', protect, getProjectMembers);

module.exports = router;

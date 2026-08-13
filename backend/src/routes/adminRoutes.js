const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAllTasks,
  deleteTask,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Every admin route requires: valid JWT (protect) + Admin role (authorize)
// This is a double-layer guard: token auth + DB-loaded role check
router.use(protect, authorize('Admin'));

// Users
router.route('/users').get(getAllUsers);
router.route('/users/:id').delete(deleteUser);

// Projects
router.route('/projects').get(getAllProjects);
router.route('/projects/:id').delete(deleteProject);

// Tasks
router.route('/tasks').get(getAllTasks);
router.route('/tasks/:id').delete(deleteTask);

module.exports = router;

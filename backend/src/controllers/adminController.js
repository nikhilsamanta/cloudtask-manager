const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const ActivityLog = require('../models/ActivityLog');

// ============================================================
// USERS
// ============================================================

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent Admin from deleting their own account
    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own Admin account',
      });
    }

    // Prevent deleting another Admin account
    if (userToDelete.role === 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete another Admin account',
      });
    }

    // Safely remove the user from all project members arrays
    // (their createdBy refs on projects/tasks remain as tombstone refs — safe MongoDB behavior)
    await Project.updateMany(
      { members: userToDelete._id },
      { $pull: { members: userToDelete._id } }
    );

    // Log Activity before deletion
    await ActivityLog.create({
      user: req.user._id,
      action: `deleted user "${userToDelete.name}" (${userToDelete.email})`,
      targetType: 'User',
      targetId: userToDelete._id,
    });

    await userToDelete.deleteOne();

    res.json({
      success: true,
      message: `User "${userToDelete.name}" has been deleted. Their created projects and tasks remain intact.`,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PROJECTS
// ============================================================

// @desc    Get all projects (Admin only)
// @route   GET /api/admin/projects
// @access  Private (Admin)
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    // Attach task count per project
    const projectsWithStats = await Promise.all(
      projects.map(async (proj) => {
        const totalTasks = await Task.countDocuments({ project: proj._id });
        const completedTasks = await Task.countDocuments({ project: proj._id, status: 'Completed' });
        return {
          ...proj.toObject(),
          totalTasks,
          completedTasks,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      })
    );

    res.json({ success: true, count: projectsWithStats.length, data: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project and its tasks (Admin only)
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Find all tasks belonging to this project
    const projectTasks = await Task.find({ project: project._id }).select('_id');
    const taskIds = projectTasks.map((t) => t._id);

    // Cascade: delete comments and attachments for each task in this project
    if (taskIds.length > 0) {
      await Comment.deleteMany({ task: { $in: taskIds } });
      await Attachment.deleteMany({ task: { $in: taskIds } });
    }

    // Cascade: delete all tasks in this project
    await Task.deleteMany({ project: project._id });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `deleted project "${project.name}" and ${taskIds.length} associated task(s)`,
      targetType: 'Project',
      targetId: project._id,
    });

    await project.deleteOne();

    res.json({
      success: true,
      message: `Project "${project.name}", its ${taskIds.length} task(s), and related comments/attachments have been removed.`,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// TASKS
// ============================================================

// @desc    Get all tasks (Admin only)
// @route   GET /api/admin/tasks
// @access  Private (Admin)
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name category')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single task (Admin only)
// @route   DELETE /api/admin/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Cascade: remove comments and attachments linked to this task
    await Comment.deleteMany({ task: task._id });
    await Attachment.deleteMany({ task: task._id });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `deleted task "${task.title}"`,
      targetType: 'Task',
      targetId: task._id,
    });

    await task.deleteOne();

    res.json({
      success: true,
      message: `Task "${task.title}" and its comments/attachments have been permanently removed.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAllTasks,
  deleteTask,
};

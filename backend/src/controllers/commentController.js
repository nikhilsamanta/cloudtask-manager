const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Helper to verify task access
const verifyTaskAccess = async (taskId, user) => {
  const task = await Task.findById(taskId);
  if (!task) return { allowed: false, status: 404, message: 'Task not found', task: null };

  if (user.role === 'Admin') return { allowed: true, task };

  const projectObj = await Project.findById(task.project);
  const isProjectCreator = projectObj && projectObj.createdBy.toString() === user._id.toString();
  const isProjectMember = projectObj && projectObj.members.some(m => m.toString() === user._id.toString());
  const isTaskAssignee = task.assignedTo?.toString() === user._id.toString();
  const isTaskCreator = task.createdBy?.toString() === user._id.toString();

  if (!isProjectCreator && !isProjectMember && !isTaskAssignee && !isTaskCreator) {
    return { allowed: false, status: 403, message: 'Not authorized to access this task', task };
  }
  return { allowed: true, task };
};

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getCommentsByTask = async (req, res, next) => {
  try {
    const access = await verifyTaskAccess(req.params.taskId, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    const access = await verifyTaskAccess(taskId, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      content,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name email avatar role'
    );

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `commented on task "${access.task.title}"`,
      targetType: 'Comment',
      targetId: comment._id,
    });

    // Notify task assignee and task creator (if different from comment author)
    const recipientsToNotify = new Set();
    const currentUserId = req.user._id.toString();

    if (access.task.assignedTo && access.task.assignedTo.toString() !== currentUserId) {
      recipientsToNotify.add(access.task.assignedTo.toString());
    }
    if (access.task.createdBy && access.task.createdBy.toString() !== currentUserId) {
      recipientsToNotify.add(access.task.createdBy.toString());
    }

    if (recipientsToNotify.size > 0) {
      const snippet = content.length > 50 ? content.substring(0, 47) + '...' : content;
      const notifications = [...recipientsToNotify].map((recipientId) => ({
        recipient: recipientId,
        sender: req.user._id,
        type: 'comment_added',
        title: 'New Comment on Task',
        message: `${req.user.name} commented on "${access.task.title}": "${snippet}"`,
        task: access.task._id,
        project: access.task.project,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByTask,
  addComment,
};

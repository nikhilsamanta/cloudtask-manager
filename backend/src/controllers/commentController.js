const Comment = require('../models/Comment');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getCommentsByTask = async (req, res, next) => {
  try {
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

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
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
      action: `commented on task "${task.title}"`,
      targetType: 'Comment',
      targetId: comment._id,
    });

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByTask,
  addComment,
};

const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');

// @desc    Get all tasks (with optional project filter & search)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, search } = req.query;
    let query = {};

    if (project) {
      query.project = project;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Role-based visibility for Employees
    if (req.user.role === 'Employee' && !project) {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name category')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task detail
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name category')
      .populate('assignedTo', 'name email avatar role department')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name avatar role')
      .sort({ createdAt: 1 });

    const attachments = await Attachment.find({ task: task._id })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...task.toObject(),
        comments,
        attachments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, Manager, Employee)
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, assignedTo, dueDate, tags } = req.body;

    const projectObj = await Project.findById(project);
    if (!projectObj) {
      return res.status(404).json({ success: false, message: 'Associated project not found' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      project,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      dueDate,
      tags: tags || [],
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `created task "${task.title}"`,
      targetType: 'Task',
      targetId: task._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name category')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name category')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `updated task "${task.title}"`,
      targetType: 'Task',
      targetId: task._id,
    });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (Kanban Drag & Drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name category')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `moved task "${task.title}" from ${oldStatus} to ${status}`,
      targetType: 'Task',
      targetId: task._id,
    });

    res.json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Manager)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Remove comments & attachments linked to task
    await Comment.deleteMany({ task: task._id });
    await Attachment.deleteMany({ task: task._id });
    await task.deleteOne();

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `deleted task "${task.title}"`,
      targetType: 'Task',
    });

    res.json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};

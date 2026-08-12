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

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Role-based visibility for non-Admin users
    if (req.user.role === 'Employee') {
      const userProjects = await Project.find({
        $or: [{ members: req.user._id }, { createdBy: req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id.toString());

      if (project) {
        if (!projectIds.includes(project.toString())) {
          return res.json({ success: true, count: 0, data: [] });
        }
        query.project = project;
      } else {
        query.project = { $in: userProjects.map((p) => p._id) };
      }
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    } else if (req.user.role === 'Manager') {
      const userProjects = await Project.find({
        $or: [{ members: req.user._id }, { createdBy: req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id.toString());

      if (project) {
        if (!projectIds.includes(project.toString())) {
          return res.json({ success: true, count: 0, data: [] });
        }
        query.project = project;
      } else {
        query.project = { $in: userProjects.map((p) => p._id) };
      }
    } else { // Admin
      if (project) {
        query.project = project;
      }
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
      .populate('project', 'name category createdBy members')
      .populate('assignedTo', 'name email avatar role department')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Authorization check for non-Admin users
    if (req.user.role !== 'Admin') {
      const projectObj = await Project.findById(task.project?._id || task.project);
      const isProjectCreator = projectObj && projectObj.createdBy.toString() === req.user._id.toString();
      const isProjectMember = projectObj && projectObj.members.some(m => m.toString() === req.user._id.toString());
      const isTaskAssignee = task.assignedTo?._id?.toString() === req.user._id.toString();
      const isTaskCreator = task.createdBy?._id?.toString() === req.user._id.toString();

      if (!isProjectCreator && !isProjectMember && !isTaskAssignee && !isTaskCreator) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
      }
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

    // Authorization check for non-Admin users
    if (!req.user.isAdmin) {
      const isCreator = projectObj.createdBy.toString() === req.user._id.toString();
      const isMember = projectObj.members.some(m => m.toString() === req.user._id.toString());
      if (!isCreator && !isMember) {
        return res.status(403).json({ success: false, message: 'Not authorized to create tasks in this project' });
      }
    }

    // Validate assignedTo is a member of the project (backend enforcement)
    if (assignedTo) {
      const isAssigneeMember =
        projectObj.createdBy.toString() === assignedTo.toString() ||
        projectObj.members.some(m => m.toString() === assignedTo.toString());
      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project. Add them to the project first.',
        });
      }
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

    // Authorization check for non-Admin users
    if (!req.user.isAdmin) {
      const projectObj = await Project.findById(task.project);
      const isProjectCreator = projectObj && projectObj.createdBy.toString() === req.user._id.toString();
      const isProjectMember = projectObj && projectObj.members.some(m => m.toString() === req.user._id.toString());
      const isTaskAssignee = task.assignedTo?.toString() === req.user._id.toString();
      const isTaskCreator = task.createdBy?.toString() === req.user._id.toString();

      if (!isProjectCreator && !isProjectMember && !isTaskAssignee && !isTaskCreator) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }

      // If assignedTo is being changed, validate the new assignee is a project member
      if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo?.toString()) {
        const isAssigneeMember =
          projectObj && (
            projectObj.createdBy.toString() === req.body.assignedTo.toString() ||
            projectObj.members.some(m => m.toString() === req.body.assignedTo.toString())
          );
        if (!isAssigneeMember) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user is not a member of this project. Add them to the project first.',
          });
        }
      }
    }

    const updateData = { ...req.body };
    delete updateData.createdBy;

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
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

    // Authorization check for non-Admin users
    if (req.user.role !== 'Admin') {
      const projectObj = await Project.findById(task.project);
      const isProjectCreator = projectObj && projectObj.createdBy.toString() === req.user._id.toString();
      const isProjectMember = projectObj && projectObj.members.some(m => m.toString() === req.user._id.toString());
      const isTaskAssignee = task.assignedTo?.toString() === req.user._id.toString();
      const isTaskCreator = task.createdBy?.toString() === req.user._id.toString();

      if (!isProjectCreator && !isProjectMember && !isTaskAssignee && !isTaskCreator) {
        return res.status(403).json({ success: false, message: 'Not authorized to update task status' });
      }
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

    // Authorization check for non-Admin users
    if (req.user.role !== 'Admin') {
      const projectObj = await Project.findById(task.project);
      const isProjectCreator = projectObj && projectObj.createdBy.toString() === req.user._id.toString();
      const isTaskCreator = task.createdBy?.toString() === req.user._id.toString();

      if (!isProjectCreator && !isTaskCreator) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
      }
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

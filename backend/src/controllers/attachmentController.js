const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const storageService = require('../utils/storageService');
const path = require('path');

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

// @desc    Upload attachment for task
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
const uploadAttachment = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const access = await verifyTaskAccess(taskId, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const fileResult = await storageService.saveFile(req.file);

    const attachment = await Attachment.create({
      task: taskId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: fileResult.url,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
    });

    const populatedAttachment = await Attachment.findById(attachment._id).populate(
      'uploadedBy',
      'name avatar'
    );

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `uploaded attachment "${req.file.originalname}" to task "${access.task.title}"`,
      targetType: 'Attachment',
      targetId: attachment._id,
    });

    res.status(201).json({ success: true, data: populatedAttachment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attachments for task
// @route   GET /api/tasks/:taskId/attachments
// @access  Private
const getAttachmentsByTask = async (req, res, next) => {
  try {
    const access = await verifyTaskAccess(req.params.taskId, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const attachments = await Attachment.find({ task: req.params.taskId })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: attachments.length, data: attachments });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / Stream attachment file
// @route   GET /api/attachments/:id/download
// @access  Private
const downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const access = await verifyTaskAccess(attachment.task, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
    res.download(filePath, attachment.originalName);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAttachment,
  getAttachmentsByTask,
  downloadAttachment,
};

const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let query = {};
    // Non-Admin users (Manager & Employee) can only see projects they created or are members of
    if (req.user.role !== 'Admin') {
      query = {
        $or: [{ members: req.user._id }, { createdBy: req.user._id }],
      };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    // Attach task count statistics per project
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

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization check for non-Admin users
    if (req.user.role !== 'Admin') {
      const isCreator = project.createdBy._id.toString() === req.user._id.toString();
      const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
      if (!isCreator && !isMember) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
      }
    }

    let taskQuery = { project: project._id };
    if (req.user.role === 'Employee') {
      taskQuery.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }
    const tasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin, Manager)
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, category, members, dueDate } = req.body;

    let projectMembers = Array.isArray(members) ? [...members] : [];
    const userIdStr = req.user._id.toString();
    if (!projectMembers.some(m => m && m.toString() === userIdStr)) {
      projectMembers.push(req.user._id);
    }

    const project = await Project.create({
      name,
      description,
      status: status || 'Active',
      category: category || 'Web Development',
      createdBy: req.user._id,
      members: projectMembers,
      dueDate,
    });

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `created project "${project.name}"`,
      targetType: 'Project',
      targetId: project._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role');

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Manager)
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization check for non-Admin users
    if (req.user.role !== 'Admin') {
      const isCreator = project.createdBy.toString() === req.user._id.toString();
      const isMember = project.members.some(m => m.toString() === req.user._id.toString());
      if (!isCreator && !isMember) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
      }
    }

    const updateData = { ...req.body };
    delete updateData.createdBy;

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role');

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `updated project "${project.name}"`,
      targetType: 'Project',
      targetId: project._id,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Manager)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization check for non-Admin users
    if (req.user.role !== 'Admin') {
      if (project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
      }
    }

    // Delete related tasks
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    // Log Activity
    await ActivityLog.create({
      user: req.user._id,
      action: `deleted project "${project.name}"`,
      targetType: 'Project',
    });

    res.json({ success: true, message: 'Project and associated tasks removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get members of a specific project (for task assignee dropdown)
// @route   GET /api/projects/:id/members
// @access  Private
const getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email avatar role department')
      .populate('createdBy', 'name email avatar role department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization: only project creator, members, or Admin can see the member list
    if (!req.user.isAdmin) {
      const isCreator = project.createdBy._id.toString() === req.user._id.toString();
      const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
      if (!isCreator && !isMember) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
      }
    }

    // Combine members + createdBy into a deduplicated list
    const memberMap = new Map();
    [project.createdBy, ...project.members].forEach((u) => {
      if (u && u._id) memberMap.set(u._id.toString(), u);
    });

    res.json({ success: true, data: [...memberMap.values()] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
};

const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let query = {};
    // Employees only see projects they are members of or created
    if (req.user.role === 'Employee') {
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

    const tasks = await Task.find({ project: project._id })
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

    const project = await Project.create({
      name,
      description,
      status: status || 'Active',
      category: category || 'Web Development',
      createdBy: req.user._id,
      members: members && members.length > 0 ? members : [req.user._id],
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

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
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
// @access  Private (Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
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

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

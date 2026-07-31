const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get Dashboard stats & analytics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    let projectQuery = {};
    let taskQuery = {};

    if (req.user.role === 'Employee') {
      projectQuery = { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };
      taskQuery = { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] };
    }

    const totalProjects = await Project.countDocuments(projectQuery);
    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'Completed' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'In Progress' });
    const todoTasks = await Task.countDocuments({ ...taskQuery, status: 'To Do' });
    const totalTeamMembers = await User.countDocuments();

    // Priority breakdown
    const highPriority = await Task.countDocuments({ ...taskQuery, priority: 'High' });
    const mediumPriority = await Task.countDocuments({ ...taskQuery, priority: 'Medium' });
    const lowPriority = await Task.countDocuments({ ...taskQuery, priority: 'Low' });

    // Recent activity log
    const recentActivities = await ActivityLog.find()
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(8);

    // Recent projects
    const recentProjects = await Project.find(projectQuery)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          pendingTasks: totalTasks - completedTasks,
          totalTeamMembers,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        statusDistribution: [
          { name: 'To Do', value: todoTasks, color: '#f59e0b' },
          { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
          { name: 'Completed', value: completedTasks, color: '#10b981' },
        ],
        priorityBreakdown: [
          { name: 'High', count: highPriority, color: '#ef4444' },
          { name: 'Medium', count: mediumPriority, color: '#f59e0b' },
          { name: 'Low', count: lowPriority, color: '#10b981' },
        ],
        recentActivities,
        recentProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};

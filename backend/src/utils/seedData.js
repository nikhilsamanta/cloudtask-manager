const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Comment = require('../models/Comment');

dotenv.config({ path: './.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudtask_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();
    await Comment.deleteMany();

    console.log('[Seeder] Cleared old data.');

    // Create Users
    const admin = await User.create({
      name: 'Alex Rivera (Admin)',
      email: 'admin@cloudtask.com',
      password: 'password123',
      role: 'Admin',
      department: 'DevOps & Architecture',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const manager = await User.create({
      name: 'Marcus Vance (Manager)',
      email: 'manager@cloudtask.com',
      password: 'password123',
      role: 'Manager',
      department: 'Product Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const employee = await User.create({
      name: 'Elena Rostova (Employee)',
      email: 'employee@cloudtask.com',
      password: 'password123',
      role: 'Employee',
      department: 'Frontend Engineering',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    const devops = await User.create({
      name: 'David Chen (DevOps)',
      email: 'david@cloudtask.com',
      password: 'password123',
      role: 'Employee',
      department: 'Cloud Infrastructure',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    console.log('[Seeder] Created default Users.');

    // Create Projects
    const project1 = await Project.create({
      name: 'Kubernetes Cluster Migration',
      description: 'Migrate core microservices from AWS EC2 monoliths to Amazon EKS cluster managed via Terraform and Helm charts.',
      status: 'Active',
      category: 'Cloud Infrastructure',
      createdBy: admin._id,
      members: [admin._id, manager._id, devops._id],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    const project2 = await Project.create({
      name: 'CloudTask Pro V2 Frontend',
      description: 'Redesign UI dashboard using React, Tailwind CSS, Kanban boards, dark mode tokens, and real-time state management.',
      status: 'Active',
      category: 'Web Development',
      createdBy: manager._id,
      members: [manager._id, employee._id],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    const project3 = await Project.create({
      name: 'Prometheus & Grafana Observability',
      description: 'Configure Prometheus metrics collection, Grafana dashboards, Loki log aggregation, and Alertmanager routing.',
      status: 'Planning',
      category: 'Monitoring & Logging',
      createdBy: admin._id,
      members: [admin._id, devops._id],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seeder] Created sample Projects.');

    // Create Tasks
    const task1 = await Task.create({
      title: 'Provision EKS Cluster with Terraform',
      description: 'Write Terraform modules for VPC, subnets, NAT Gateways, and EKS node pools with auto-scaling enabled.',
      status: 'In Progress',
      priority: 'High',
      project: project1._id,
      assignedTo: devops._id,
      createdBy: admin._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      tags: ['Terraform', 'AWS', 'EKS'],
    });

    const task2 = await Task.create({
      title: 'Dockerize Express API & Multi-stage Build',
      description: 'Optimize Dockerfile using Node 20 Alpine base image, non-root user security, and layer caching.',
      status: 'Completed',
      priority: 'High',
      project: project1._id,
      assignedTo: admin._id,
      createdBy: admin._id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['Docker', 'Backend'],
    });

    const task3 = await Task.create({
      title: 'Implement Interactive Kanban Board',
      description: 'Build responsive 3-column drag-and-drop board for To Do, In Progress, and Completed task states.',
      status: 'In Progress',
      priority: 'High',
      project: project2._id,
      assignedTo: employee._id,
      createdBy: manager._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['React', 'Kanban', 'UI'],
    });

    const task4 = await Task.create({
      title: 'Setup JWT Auth & Role Authorization',
      description: 'Secure Express API endpoints using JWT Bearer token headers and role middleware checks.',
      status: 'Completed',
      priority: 'High',
      project: project2._id,
      assignedTo: employee._id,
      createdBy: manager._id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['Security', 'JWT', 'API'],
    });

    const task5 = await Task.create({
      title: 'Configure Grafana Dashboards for API Latency',
      description: 'Design dashboards rendering P95/P99 request latency, HTTP status codes, and CPU/Memory usage metrics.',
      status: 'To Do',
      priority: 'Medium',
      project: project3._id,
      assignedTo: devops._id,
      createdBy: admin._id,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      tags: ['Grafana', 'DevOps'],
    });

    console.log('[Seeder] Created sample Tasks.');

    // Add Comments
    await Comment.create({
      task: task1._id,
      user: admin._id,
      content: 'Make sure to configure managed node groups with encrypted EBS volumes!',
    });

    await Comment.create({
      task: task1._id,
      user: devops._id,
      content: 'Will do! Terraform module state is backed up in S3 with DynamoDB locking.',
    });

    await Comment.create({
      task: task3._id,
      user: manager._id,
      content: 'UI looks incredible! Make sure dark mode color contrast passes WCAG AA standards.',
    });

    // Add Activity Logs
    await ActivityLog.create({
      user: admin._id,
      action: 'created project "Kubernetes Cluster Migration"',
      targetType: 'Project',
      targetId: project1._id,
    });

    await ActivityLog.create({
      user: devops._id,
      action: 'moved task "Provision EKS Cluster with Terraform" to In Progress',
      targetType: 'Task',
      targetId: task1._id,
    });

    await ActivityLog.create({
      user: employee._id,
      action: 'completed task "Setup JWT Auth & Role Authorization"',
      targetType: 'Task',
      targetId: task4._id,
    });

    console.log('[Seeder] Database successfully seeded! 🎉');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Error]:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

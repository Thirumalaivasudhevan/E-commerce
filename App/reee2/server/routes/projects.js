const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth'); // Need to create middleware

// GET ALL PROJECTS
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE PROJECT
router.post('/', verifyToken, async (req, res) => {
  const { title, description, dueDate, priority, status } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        status: status || 'doing',
        progress: 0,
        team: [] // Empty team for now
      }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE STATUS / PROGRESS
router.put('/:id', verifyToken, async (req, res) => {
  const { status, progress } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status, progress }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the project
 *         title:
 *           type: string
 *           description: The title of the project
 *         description:
 *           type: string
 *           description: The description of the project
 *         status:
 *           type: string
 *           description: The status of the project (todo, doing, done)
 *           enum: [todo, doing, done]
 *         progress:
 *           type: integer
 *           description: The progress percentage (0-100)
 *         dueDate:
 *           type: string
 *           format: date
 *           description: The due date of the project
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the project was created
 *       example:
 *         id: d5fE_asz
 *         title: New Website Launch
 *         description: Launching the new company website.
 *         status: doing
 *         progress: 45
 *         dueDate: 2024-12-31
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: The projects managing API
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Returns the list of all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: The created project.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       500:
 *         description: Some server error
 * 
 */
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

// UPDATE PROJECT DETAILS
router.put('/:id', verifyToken, async (req, res) => {
  const { title, description, status, progress, priority, dueDate } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        progress,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PROJECT
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

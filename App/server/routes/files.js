const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     FileObject:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the file/folder
 *         name:
 *           type: string
 *           description: The name of the file/folder
 *         type:
 *           type: string
 *           description: The type of object (folder, image, doc, etc.)
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: The ID of the parent folder (null for root)
 *         size:
 *           type: string
 *           description: Size of the file (e.g., '1.2 MB')
 *         url:
 *           type: string
 *           description: URL of the file (if applicable)
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: f1_xyz
 *         name: "Project Documents"
 *         type: "folder"
 *         parentId: null
 *         size: null
 *         url: null
 */

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File Manager API
 */

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List files and folders
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: The ID of the parent folder to list contents of
 *     responses:
 *       200:
 *         description: List of files and folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileObject'
 *   post:
 *     summary: Create a new file or folder
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: folder
 *               parentId:
 *                 type: string
 *               size:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created file object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileObject'
 */
router.get('/', verifyToken, async (req, res) => {
  const { parentId, filter } = req.query;

  try {
    let whereClause = { isDeleted: false }; // Default: show non-deleted files

    if (filter === 'deleted') {
      whereClause = { isDeleted: true };
    } else if (filter === 'starred') {
      whereClause = { isDeleted: false, isStarred: true };
    } else if (filter === 'recent') {
      whereClause = { isDeleted: false };
      // Additional logic for "Recent" could be date-based
    } else if (['video', 'audio', 'doc', 'image', 'app', 'archive'].includes(filter)) {
      whereClause = { isDeleted: false, type: filter };
    } else if (filter === 'folder') {
      whereClause = { isDeleted: false, type: 'folder' };
    } else {
      // Normal folder view
      whereClause = {
        isDeleted: false,
        parentId: parentId || null
      };
    }

    const files = await prisma.fileObject.findMany({
      where: whereClause,
      orderBy: filter === 'recent' ? { updatedAt: 'desc' } : { type: 'asc' }
    });

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE FILE / FOLDER
router.post('/', verifyToken, async (req, res) => {
  const { name, type, parentId, size } = req.body;

  try {
    const file = await prisma.fileObject.create({
      data: {
        name,
        type,
        parentId: parentId || null,
        size: size || (type === 'folder' ? null : '1.2 MB'),
        url: type === 'folder' ? null : 'https://picsum.photos/200'
      }
    });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE FILE / FOLDER (Rename)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const file = await prisma.fileObject.update({
      where: { id },
      data: { name }
    });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// TOGGLE STAR
router.put('/:id/star', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const file = await prisma.fileObject.findUnique({ where: { id } });
    if (!file) return res.status(404).json({ error: "File not found" });

    const updated = await prisma.fileObject.update({
      where: { id },
      data: { isStarred: !file.isStarred }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle star" });
  }
});

// DELETE FILE / FOLDER (Soft Delete)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { hardDelete } = req.query; // Optional hard delete for Trash

  try {
    if (hardDelete === 'true') {
      await prisma.fileObject.delete({ where: { id } });
    } else {
      await prisma.fileObject.update({
        where: { id },
        data: { isDeleted: true }
      });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// RESTORE FILE
router.put('/:id/restore', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.fileObject.update({
      where: { id },
      data: { isDeleted: false }
    });
    res.json({ message: "Item restored" });
  } catch (err) {
    res.status(500).json({ error: "Failed to restore item" });
  }
});

module.exports = router;

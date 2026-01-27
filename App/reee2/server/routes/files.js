const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET FILES (Can filter by parentId)
router.get('/', verifyToken, async (req, res) => {
  const { parentId } = req.query;
  
  try {
    const files = await prisma.fileObject.findMany({
      where: {
        parentId: parentId || null // If no parentId, fetch root files (parentId: null)
      },
      orderBy: { type: 'asc' } // Folders first (usually 'folder' < 'image')
    });
    
    // Also fetch the parent folder details to show breadcrumbs logic in frontend
    // (Frontend can also just keep track of visited folders)
    
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
        type, // 'folder', 'image', 'doc'
        parentId: parentId || null,
        size: size || (type === 'folder' ? null : '1.2 MB'), // Mock size
        url: type === 'folder' ? null : 'https://picsum.photos/200' // Mock URL
      }
    });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

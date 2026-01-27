const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET POSTS
router.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
         user: {
           select: { name: true, avatar: true }
         },
         comments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE POST
router.post('/', verifyToken, async (req, res) => {
  const { content, image } = req.body;
  
  try {
    const post = await prisma.post.create({
      data: {
        content,
        image,
        userId: req.user.id
      },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

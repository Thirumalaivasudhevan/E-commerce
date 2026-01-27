const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the post
 *         content:
 *           type: string
 *           description: Post content
 *         image:
 *           type: string
 *           description: Optional image URL
 *         likes:
 *           type: integer
 *           description: Number of likes
 *         userId:
 *           type: string
 *           description: ID of the author
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: post_123
 *         content: "Just launched my new project!"
 *         image: "https://example.com/image.jpg"
 *         likes: 5
 *         userId: "u1_123"
 */

/**
 * @swagger
 * tags:
 *   name: Social
 *   description: Social Network API
 */

/**
 * @swagger
 * /api/social:
 *   get:
 *     summary: Get all posts
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *   post:
 *     summary: Create a new post
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
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

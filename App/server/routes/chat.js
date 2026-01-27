const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - content
 *         - receiverId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the message
 *         content:
 *           type: string
 *           description: Message content
 *         senderId:
 *           type: string
 *           description: ID of the sender
 *         receiverId:
 *           type: string
 *           description: ID of the receiver
 *         isRead:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: m1_abc
 *         content: "Hello there!"
 *         senderId: "u1_123"
 *         receiverId: "u2_456"
 *         isRead: false
 */

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and Messaging API
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get messages or contact list
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: partnerId
 *         schema:
 *           type: string
 *         description: The ID of the user to get messages with. If omitted, returns list of contacts.
 *     responses:
 *       200:
 *         description: List of messages or contacts
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 - type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatar:
 *                             type: string
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: The sent message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
// GET MESSAGES
router.get('/', verifyToken, async (req, res) => {
  const currentUserId = req.user.id;
  const { partnerId } = req.query; // Who am I chatting with?

  if (!partnerId) {
    // Return list of contacts (Everyone in the system for now)
    try {
      const users = await prisma.user.findMany({
        where: { id: { not: currentUserId } },
        select: { id: true, name: true, avatar: true }
      });
      return res.json({ users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEND MESSAGE
router.post('/', verifyToken, async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId
      }
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

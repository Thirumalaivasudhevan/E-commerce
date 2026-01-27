const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

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
     } catch(err) {
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

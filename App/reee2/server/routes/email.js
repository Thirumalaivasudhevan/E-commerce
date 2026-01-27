const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET EMAILS (Inbox, Sent, etc)
router.get('/', verifyToken, async (req, res) => {
  const { folder } = req.query; // 'inbox', 'sent', 'starred'
  const userEmail = req.user.email; // Extracted from token

  try {
    let whereClause = {};
    if (folder === 'sent') {
      whereClause = { from: userEmail };
    } else {
      // Default to Inbox (emails sent TO me)
      whereClause = { to: userEmail };
    }

    const emails = await prisma.email.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEND EMAIL
router.post('/', verifyToken, async (req, res) => {
  const { to, subject, content } = req.body;
  const from = req.user.email;

  try {
    const email = await prisma.email.create({
      data: {
        from,
        to,
        subject,
        content,
        folder: 'inbox', // It lands in the recipient's inbox
        isRead: false
      }
    });
    res.json(email);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

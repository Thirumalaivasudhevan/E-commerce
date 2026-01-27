const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Email:
 *       type: object
 *       required:
 *         - to
 *         - subject
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the email
 *         from:
 *           type: string
 *           description: Sender email address
 *         to:
 *           type: string
 *           description: Recipient email address
 *         subject:
 *           type: string
 *           description: Email subject
 *         content:
 *           type: string
 *           description: Email body content
 *         folder:
 *           type: string
 *           description: Folder (inbox, sent, trash, etc.)
 *           default: inbox
 *         isRead:
 *           type: boolean
 *           description: Read status
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: e1_xyz
 *         from: "me@example.com"
 *         to: "boss@example.com"
 *         subject: "Project Update"
 *         content: "Here is the weekly report."
 *         folder: "sent"
 */

/**
 * @swagger
 * tags:
 *   name: Emails
 *   description: Email API
 */

/**
 * @swagger
 * /api/emails:
 *   get:
 *     summary: Get emails by folder
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           enum: [inbox, sent, trash, starred]
 *         description: The folder to retrieve emails from (default inbox)
 *     responses:
 *       200:
 *         description: List of emails
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Email'
 *   post:
 *     summary: Send a new email
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - content
 *             properties:
 *               to:
 *                 type: string
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: The sent email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Email'
 */
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

const { sendEmail } = require('../services/emailService');

// SEND EMAIL
router.post('/', verifyToken, async (req, res) => {
  const { to, subject, content } = req.body;
  const from = req.user.email;

  try {
    // 1. Save to Database (Always do this for history)
    const email = await prisma.email.create({
      data: {
        from,
        to,
        subject,
        content,
        folder: 'inbox',
        isRead: false
      }
    });

    // 2. Try to send Real Email via SMTP
    // We don't want to block the response if SMTP fails (optional design choice),
    // but usually user wants to know if it failed. 
    // For now we will await it and return error if it fails, or just log warning.
    try {
      await sendEmail({
        to,
        subject,
        text: content,
        html: `<p>${content}</p>` // Simple HTML wrap
      });
    } catch (smtpError) {
      console.error("SMTP Error:", smtpError.message);
      // We could return 206 Partial Content or include a warning field
      // But for now, let's not crash the whole request if DB save was success.
    }

    res.json(email);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

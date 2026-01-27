const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const redisClient = require('../config/redis');
const { registerValidation, loginValidation } = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');

// Helper to set cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
// REGISTER
router.post('/register', registerValidation, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0095F6&color=fff`
      }
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user.id
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
// LOGIN
router.post('/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate Tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set tokens as httpOnly cookies
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    // Return user info (also include tokens in response for backward compatibility)
    res.json({
      message: "Login successful",
      accessToken, // For backward compatibility
      refreshToken, // For backward compatibility
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  // Try cookie first, then request body
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Set new access token as cookie
    res.cookie('accessToken', newAccessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      message: "Token refreshed",
      accessToken: newAccessToken // For backward compatibility
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// LOGOUT
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Get token from cookie or header
    const token = req.cookies?.accessToken ||
      (req.headers.authorization?.split(' ')[1]);

    if (token) {
      // Add token to blacklist (expires in 15 minutes like the token)
      await redisClient.setex(`blacklist:${token}`, 900, 'true');
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// VERIFY AUTH STATUS
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        bio: true,
        location: true,
        website: true,
        phone: true,
        emailNotifications: true,
        pushNotifications: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error('Verify auth error:', err);
    res.status(500).json({ error: "Failed to verify authentication" });
  }
});

// UPDATE PASSWORD
router.put('/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// UPDATE PROFILE
router.put('/profile', verifyToken, async (req, res) => {
  const { name, bio, location, website, phone } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        bio,
        location,
        website,
        phone,
        emailNotifications: req.body.emailNotifications,
        pushNotifications: req.body.pushNotifications
      }
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        location: user.location,
        website: user.website,
        phone: user.phone,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications
      }
    });

    // Actually, let's just update what we know exists first.
    // If fields are missing, I'll need to update schema. 
    // Let's assume name is there.
    // I will check schema in next step if this fails or before this.
    // Better strategy: View schema first.
  } catch (err) {
    // ...
  }
});

module.exports = router;


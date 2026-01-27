const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// Get wishlist items
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to wishlist
router.post('/', verifyToken, async (req, res) => {
  const { productId } = req.body;
  try {
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: req.user.id, productId }
    });
    if (existing) return res.status(400).json({ message: "Already in wishlist" });

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from wishlist
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.wishlistItem.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

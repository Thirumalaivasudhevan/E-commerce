const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// Get cart items for logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    // Check if item already exists in cart
    const existing = await prisma.cartItem.findFirst({
      where: { 
        userId: req.user.id,
        productId: productId
      }
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) }
      });
      return res.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId: productId,
        quantity: quantity || 1
      }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item quantity
router.put('/:id', verifyToken, async (req, res) => {
  const { quantity } = req.body;
  try {
    const updated = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

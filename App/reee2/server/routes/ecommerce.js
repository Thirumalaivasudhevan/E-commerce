const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { name, price, oldPrice, discount, category, description, image, stock, rating } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and Price are required" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        discount,
        category,
        description,
        image,
        stock: stock ? parseInt(stock) : 10,
        rating: rating ? parseFloat(rating) : 4.5
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { name, price, oldPrice, discount, category, description, image, stock, rating } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        price: price ? parseFloat(price) : undefined,
        oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
        discount,
        category,
        description,
        image,
        stock: stock ? parseInt(stock) : undefined,
        rating: rating ? parseFloat(rating) : undefined
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    // Use transaction to delete related records first (Cascasde delete emulation)
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ]);

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

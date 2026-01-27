const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         discount:
 *           type: string
 *           description: Discount text
 *         category:
 *           type: string
 *           description: Product category
 *         description:
 *           type: string
 *           description: Product description
 *         image:
 *           type: string
 *           description: Base64 image or URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: p1_abc
 *         name: "Premium Headphones"
 *         price: 199.99
 *         category: "Electronics"
 */

/**
 * @swagger
 * tags:
 *   name: Ecommerce
 *   description: Product management API
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products
 *     tags: [Ecommerce]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Ecommerce]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
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

router.post('/', verifyToken, async (req, res) => {
  const { name, price, discount, category, description, image } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and Price are required" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        discount,
        category,
        description,
        image
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { name, price, discount, category, description, image } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        price: price ? parseFloat(price) : undefined,
        discount,
        category,
        description,
        image
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

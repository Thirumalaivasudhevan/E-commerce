const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// Get order history
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { 
        items: { include: { product: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new order (Checkout)
router.post('/', verifyToken, async (req, res) => {
  const { totalAmount, paymentMethod, address, city, state, zip, phone, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cannot create order with empty items" });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Validate stock availability for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });
        
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
      }

      // 2. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          paymentMethod,
          address,
          city,
          state,
          zip,
          phone,
          status: 'paid', // Mocking successful payment
          invoiceId: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }
      });

      // 2. Create order items and update stock
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 3. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user.id }
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific order details (for Invoice)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { 
        items: { include: { product: true } },
        user: { select: { name: true, email: true } }
      }
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// Get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a review
router.post('/', verifyToken, async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        productId,
        rating: parseInt(rating),
        comment,
        userId: req.user.id
      },
      include: { user: { select: { name: true, avatar: true } } }
    });
    
    // Update product average rating and count
    const allReviews = await prisma.review.findMany({
      where: { productId }
    });
    
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviews: allReviews.length
      }
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a review
router.put('/:id', verifyToken, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const existingReview = await prisma.review.findUnique({
        where: { id: req.params.id }
    });

    if (existingReview.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        rating: rating ? parseInt(rating) : undefined,
        comment
      },
      include: { user: { select: { name: true, avatar: true } } }
    });

    // Update product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId }
    });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: avgRating }
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a review
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
        where: { id: req.params.id }
    });

    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.review.delete({
      where: { id: req.params.id }
    });

    // Update product average rating and count
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId }
    });
    
    const count = allReviews.length;
    const avgRating = count > 0 ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / count) : 4.5;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: avgRating,
        reviews: count
      }
    });

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

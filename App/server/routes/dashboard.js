const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const [
            totalUsers,
            totalProjects,
            totalOrders,
            totalRevenueArg,
            recentUsers,
            recentOrders
        ] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { totalAmount: true }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, avatar: true, createdAt: true } // country is not in schema
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            })
        ]);

        const totalRevenue = totalRevenueArg._sum.totalAmount || 0;

        res.json({
            stats: {
                users: totalUsers,
                projects: totalProjects,
                orders: totalOrders,
                revenue: totalRevenue
            },
            recentUsers,
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;

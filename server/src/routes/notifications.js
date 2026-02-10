import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/notifications - Get user's notifications
router.get('/', async (req, res, next) => {
  try {
    const { unreadOnly, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.id };

    if (unreadOnly === 'true') {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, read: false } }),
    ]);

    res.json({
      notifications,
      total,
      unreadCount,
      hasMore: parseInt(offset) + notifications.length < total,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/:notificationId/read - Mark as read
router.post('/:notificationId/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: req.params.notificationId,
        userId: req.user.id,
      },
      data: { read: true },
    });

    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:notificationId - Delete notification
router.delete('/:notificationId', async (req, res, next) => {
  try {
    await prisma.notification.delete({
      where: {
        id: req.params.notificationId,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications - Clear all notifications
router.delete('/', async (req, res, next) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
});

export default router;

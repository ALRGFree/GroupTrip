import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
  preferences: z.object({}).passthrough().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/users/profile
router.patch('/profile', async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        preferences: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/change-password
router.post('/change-password', async (req, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const validPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/groups
router.get('/groups', async (req, res, next) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true, events: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const groups = memberships.map((m) => ({
      ...m.group,
      role: m.role,
      travelStatus: m.travelStatus,
      memberCount: m.group._count.members,
      eventCount: m.group._count.events,
    }));

    res.json({ groups });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/account
router.delete('/account', async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

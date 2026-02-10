import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate, requireGroupMember } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

const createEventSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['meal', 'activity', 'sightseeing', 'transportation', 'accommodation', 'entertainment', 'other']).default('activity'),
  datetime: z.string().datetime(),
  endDatetime: z.string().datetime().optional().nullable(),
  location: z.string().optional(),
  address: z.string().optional(),
  cost: z.number().optional().nullable(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  isPublic: z.boolean().default(true),
});

const updateEventSchema = createEventSchema.partial().omit({ groupId: true });

// GET /api/events - Get events for a group
router.get('/', async (req, res, next) => {
  try {
    const { groupId, from, to, category } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: 'groupId is required' });
    }

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const where = { groupId };

    if (from || to) {
      where.datetime = {};
      if (from) where.datetime.gte = new Date(from);
      if (to) where.datetime.lte = new Date(to);
    }

    if (category) {
      where.category = category;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { datetime: 'asc' },
    });

    res.json({ events });
  } catch (error) {
    next(error);
  }
});

// POST /api/events - Create an event
router.post('/', async (req, res, next) => {
  try {
    const data = createEventSchema.parse(req.body);

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: data.groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        datetime: new Date(data.datetime),
        endDatetime: data.endDatetime ? new Date(data.endDatetime) : null,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:eventId - Get single event
router.get('/:eventId', async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: event.groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:eventId - Update event
router.patch('/:eventId', async (req, res, next) => {
  try {
    const data = updateEventSchema.parse(req.body);

    const existingEvent = await prisma.event.findUnique({
      where: { id: req.params.eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: existingEvent.groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const event = await prisma.event.update({
      where: { id: req.params.eventId },
      data: {
        ...data,
        datetime: data.datetime ? new Date(data.datetime) : undefined,
        endDatetime: data.endDatetime !== undefined
          ? (data.endDatetime ? new Date(data.endDatetime) : null)
          : undefined,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({ event });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:eventId - Delete event
router.delete('/:eventId', async (req, res, next) => {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: req.params.eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: existingEvent.groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    await prisma.event.delete({
      where: { id: req.params.eventId },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/events/:eventId/duplicate - Duplicate an event
router.post('/:eventId/duplicate', async (req, res, next) => {
  try {
    const { newDatetime } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: req.params.eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: existingEvent.groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const { id, createdAt, updatedAt, ...eventData } = existingEvent;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        title: `${eventData.title} (Copy)`,
        datetime: newDatetime ? new Date(newDatetime) : eventData.datetime,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
});

export default router;

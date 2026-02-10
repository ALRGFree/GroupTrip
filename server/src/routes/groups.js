import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { authenticate, requireGroupMember, requireGroupAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Helper to generate invite codes
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Validation schemas
const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
});

const updateGroupSchema = createGroupSchema.partial();

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member']).optional(),
  travelStatus: z.enum(['planning', 'traveling', 'arrived', 'departed']).optional(),
  flights: z.array(z.any()).optional(),
  drives: z.array(z.any()).optional(),
  accommodations: z.array(z.any()).optional(),
});

// GET /api/groups - List user's groups
router.get('/', async (req, res, next) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      include: {
        group: {
          include: {
            createdBy: {
              select: { id: true, name: true, avatar: true },
            },
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

// POST /api/groups - Create a new group
router.post('/', async (req, res, next) => {
  try {
    const data = createGroupSchema.parse(req.body);

    const group = await prisma.group.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        inviteCode: generateInviteCode(),
        createdById: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'admin',
            status: 'confirmed',
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    res.status(201).json({ group });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups/join - Join a group by invite code
router.post('/join', async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code required' });
    }

    const group = await prisma.group.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!group) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: group.id,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({ error: 'Already a member of this group' });
    }

    // Add as member
    await prisma.groupMember.create({
      data: {
        userId: req.user.id,
        groupId: group.id,
        role: 'member',
        status: 'confirmed',
      },
    });

    // Fetch updated group
    const updatedGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    res.json({ group: updatedGroup });
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/:groupId - Get group details
router.get('/:groupId', requireGroupMember, async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.groupId },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatar: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        events: {
          orderBy: { datetime: 'asc' },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group, membership: req.membership });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/groups/:groupId - Update group
router.patch('/:groupId', requireGroupAdmin, async (req, res, next) => {
  try {
    const data = updateGroupSchema.parse(req.body);

    const group = await prisma.group.update({
      where: { id: req.params.groupId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    res.json({ group });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/groups/:groupId - Delete group
router.delete('/:groupId', requireGroupAdmin, async (req, res, next) => {
  try {
    await prisma.group.delete({
      where: { id: req.params.groupId },
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups/:groupId/regenerate-code - Regenerate invite code
router.post('/:groupId/regenerate-code', requireGroupAdmin, async (req, res, next) => {
  try {
    const group = await prisma.group.update({
      where: { id: req.params.groupId },
      data: { inviteCode: generateInviteCode() },
    });

    res.json({ inviteCode: group.inviteCode });
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/:groupId/members - Get group members
router.get('/:groupId/members', requireGroupMember, async (req, res, next) => {
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId: req.params.groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ members });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/groups/:groupId/members/:memberId - Update member
router.patch('/:groupId/members/:memberId', requireGroupMember, async (req, res, next) => {
  try {
    const data = updateMemberSchema.parse(req.body);

    // Only allow self-update for non-admins, except role changes
    if (req.membership.role !== 'admin' && req.params.memberId !== req.membership.id) {
      // Allow updating own travel details
      if (req.membership.userId !== (await prisma.groupMember.findUnique({ where: { id: req.params.memberId } }))?.userId) {
        return res.status(403).json({ error: 'Cannot update other members' });
      }
    }

    // Only admins can change roles
    if (data.role && req.membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    const member = await prisma.groupMember.update({
      where: { id: req.params.memberId },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    });

    res.json({ member });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/groups/:groupId/members/:memberId - Remove member
router.delete('/:groupId/members/:memberId', requireGroupMember, async (req, res, next) => {
  try {
    const memberToRemove = await prisma.groupMember.findUnique({
      where: { id: req.params.memberId },
    });

    if (!memberToRemove) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Allow self-removal or admin removal
    const isSelf = memberToRemove.userId === req.user.id;
    const isAdmin = req.membership.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Cannot remove other members' });
    }

    await prisma.groupMember.delete({
      where: { id: req.params.memberId },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/groups/:groupId/my-travel - Update own travel details
router.patch('/:groupId/my-travel', requireGroupMember, async (req, res, next) => {
  try {
    const { flights, drives, accommodations, travelStatus } = req.body;

    const member = await prisma.groupMember.update({
      where: { id: req.membership.id },
      data: {
        flights: flights !== undefined ? flights : undefined,
        drives: drives !== undefined ? drives : undefined,
        accommodations: accommodations !== undefined ? accommodations : undefined,
        travelStatus: travelStatus !== undefined ? travelStatus : undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    res.json({ member });
  } catch (error) {
    next(error);
  }
});

export default router;

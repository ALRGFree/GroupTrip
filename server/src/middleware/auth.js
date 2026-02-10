import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        preferences: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without auth
    next();
  }
}

export async function requireGroupMember(req, res, next) {
  try {
    const groupId = req.params.groupId || req.body.groupId;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID required' });
    }

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

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireGroupAdmin(req, res, next) {
  try {
    const groupId = req.params.groupId || req.body.groupId;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID required' });
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
}

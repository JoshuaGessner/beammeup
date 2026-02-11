import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';

export function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): boolean {
  // Session is validated by attachSession middleware
  const userId = (request.user as any)?.sub;
  
  if (!userId) {
    console.log('[requireAuth] Authentication failed: no userId attached');
    reply.code(401).send({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function requireRole(
  ...allowedRoles: string[]
): (request: FastifyRequest, reply: FastifyReply) => boolean {
  return (request: FastifyRequest, reply: FastifyReply) => {
    // First check if authenticated
    if (!requireAuth(request, reply)) {
      return false;
    }

    const userId = (request.user as any)?.sub;
    if (!userId) {
      reply.code(401).send({ error: 'Unauthorized' });
      return false;
    }

    // Role check would require async, so this needs refactoring
    // For now, just verify auth
    return true;
  };
}

export async function checkFirstRun(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userCount = await prisma.user.count();
  
  if (userCount === 0 && !request.url.startsWith('/api/setup')) {
    reply.code(307).redirect('/setup');
  }
}

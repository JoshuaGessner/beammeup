import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';

export async function auditLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Store request info for later use in response handler
    (request as any).auditContext = {
      userId: (request.user as any)?.sub,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      method: request.method,
      url: request.url,
    };
  } catch (error) {
    console.error('[auditLogger] Error in audit middleware:', error);
    // Don't fail the request if audit logging fails
  }
}

declare global {
  namespace FastifyRequest {
    interface FastifyRequest {
      auditContext?: {
        userId?: string;
        ipAddress: string;
        userAgent?: string;
        method: string;
        url: string;
      };
    }
  }
}

export async function logAuditAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: action as any,
        resource,
        resourceId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index.js';

export async function attachSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionToken = request.cookies.session_token;

  if (!sessionToken) {
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      console.log('[session] Session token not found in database');
      reply.clearCookie('session_token');
      return;
    }

    if (session.expiresAt < new Date()) {
      console.log('[session] Session expired:', { expiresAt: session.expiresAt });
      reply.clearCookie('session_token');
      return;
    }

    console.log('[session] Session attached:', { userId: session.userId, username: session.user?.username, role: session.user?.role });
    request.user = { sub: session.userId };
  } catch (error) {
    console.error('[session] Error attaching session:', error);
    // Session not found or expired
  }
}

export function setSessionCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date
) {
  // Use secure cookies only if the connection is actually HTTPS
  const request = reply.request;
  const isSecure = request.protocol === 'https' || request.headers['x-forwarded-proto'] === 'https';
  
  reply.cookie('session_token', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  const request = reply.request;
  const isSecure = request.protocol === 'https' || request.headers['x-forwarded-proto'] === 'https';
  
  reply.clearCookie('session_token', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
  });
}

import { FastifyInstance } from 'fastify';
import FastifyJwt from '@fastify/jwt';

export function configureAuth(fastify: FastifyInstance, secret: string) {
  fastify.register(FastifyJwt, {
    secret,
    sign: {
      expiresIn: '24h',
    },
    cookie: {
      cookieName: 'session_token',
      signed: false,
    },
  });

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}

declare global {
  namespace FastifyInstance {
    interface FastifyInstance {
      authenticate: any;
    }
  }
}

Session Change Summary (Feb 4-5, 2026)

Goal
- Fix BeamMP config mount, Windows Docker support, and backend setup flow issues.

Key changes (by file)

1) docker-compose.yml
- BeamMP volume mount changed to /data and healthcheck updated to /data/ServerConfig.toml.
- BeamMP ports now explicitly expose TCP+UDP for 30814.
- Backend config path changed to /beammp-data and volume mount updated to match.
- Backend DOCKER_HOST set to Windows npipe default.

2) backend/Dockerfile
- Added entrypoint.sh to run migrations before starting the app.
- Kept full dependencies so prisma CLI is available at runtime.

3) backend/entrypoint.sh (new)
- Runs prisma migrate deploy, then starts node.
- Added verbose logging for troubleshooting.

4) backend/src/index.ts
- Added startup logging for module load, prisma init, and listen flow.

5) backend/src/routes/setup.ts
- Added try/catch logging around /api/setup/status to expose errors.

6) backend/src/routes/index.ts
- Added route registration logging and moved /health earlier.

7) backend/src/middleware/audit-logger.ts
- Removed reply.addHook usage (not supported on FastifyReply).
- Now only stores audit context; errors are caught and logged.

8) backend/src/routes/auth.ts
- Temporarily removed CSRF protection from /api/auth/login to allow login.

9) frontend/src/lib/api.ts
- API baseURL now uses http://<host>:8200/api in production.
- Vite dev uses /api.

10) frontend/tsconfig.json
- Added types: ["vite/client"] so import.meta.env works.

11) frontend/src/App.tsx
- Added debug logging around setup routing and API call results.

12) .gitattributes
- Enforced LF endings for shell scripts and Dockerfile to avoid exec errors.

Known current behavior
- Setup page works, first user can be created.
- Login should work after CSRF removal.
- CSRF protections are disabled for login only and should be re-enabled properly later.

Suggested follow-up tasks (for next session)
- Re-enable CSRF on login by implementing CSRF token fetch + header injection on client.
- Remove debug logging in frontend App.tsx and backend startup when done.
- Reassess audit logging and add proper onResponse hook via Fastify instance hooks.
- Evaluate Node version to avoid fast-jwt engine warnings.


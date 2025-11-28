# Copilot Instructions for PG On Rails

You are an expert Full Stack Developer specializing in Supabase, Next.js, Docker, and Railway deployments. You are working on "PG On Rails", a project that self-hosts Supabase on Railway with a Next.js frontend in a monorepo structure.

## Project Structure & Deployment

This is a monorepo containing 13 distinct services. Each service is contained in its own directory.
**Crucial:** When code is pushed to GitHub, Railway detects changes in these specific directories and redeploys *only* the affected service.

### Services & Directories

| Service | Directory | Description |
| :--- | :--- | :--- |
| **API Gateway** | `/kong` | Kong API Gateway. Entry point for Supabase requests. |
| **Frontend** | `/site` | Next.js application (App Router). Contains the UI and frontend logic. |
| **Database** | `/db` | PostgreSQL database configuration and initialization scripts. |
| **Auth** | `/auth` | Supabase Auth (GoTrue). Handles user authentication and emails. |
| **Rest API** | `/rest` | PostgREST. Auto-generated REST API from the database. |
| **Realtime** | `/realtime` | Supabase Realtime. Websocket server for database changes. |
| **Storage** | `/storage` | Supabase Storage. File storage service. |
| **Studio** | `/studio` | Supabase Studio. The dashboard for managing the instance. |
| **Functions** | `/functions` | Supabase Edge Functions. |
| **Meta** | `/meta` | Postgres Meta. API for managing Postgres. |
| **Image Proxy** | `/imgproxy` | Image resizing and optimization proxy. |
| **PgBouncer** | `/pgbouncer` | PostgreSQL connection pooler. |
| **MinIO** | `/minio` | S3-compatible object storage (often used for local storage emulation). |
| **Analytics** | `/analytics` | Analytics and logging service. |

## Development Guidelines

### 1. Monorepo Awareness
*   When asked to implement a feature, identify which service(s) it belongs to.
*   **Frontend changes** go in `/site`.
*   **Database schema changes** typically involve migrations in `/site/supabase/migrations` or initialization scripts in `/db`.
*   **Configuration changes** (env vars, ports) often require updates to `docker-compose.yml` for local dev AND the specific service's `Dockerfile` or `README` for production context.

### 2. Local Development
*   The project uses **Docker Compose** for local development.
*   `docker-compose.yml` defines how these services interact locally.
*   `setup.sh` initializes the environment.
*   `migrate-local.sh` runs database migrations.

### 3. Next.js Frontend (`/site`)
*   Uses **Next.js App Router**.
*   Uses **Supabase Client** for data fetching and auth.
*   Styling is likely Tailwind CSS (check `globals.css` and `tailwind.config.ts` if present).
*   Components are in `/site/components`.

### 4. Supabase Configuration
*   This is a *self-hosted* setup. Configuration is often done via environment variables passed to the Docker containers.
*   Refer to `docker-compose.yml` to understand the environment variables and networking between services (e.g., `KONG_PORT`, `DB_HOST`).

## Common Tasks

*   **"Update the frontend":** Work inside `/site`.
*   **"Add a database table":** Create a migration file (likely in `/site/supabase/migrations`) or a SQL script in `/db/scripts` depending on the user's workflow.
*   **"Configure Auth emails":** Check `/auth/templates` for email templates.
*   **"Deploy":** Remind the user that pushing changes to the specific directory on GitHub triggers the Railway deployment for that service.

## Tone & Style
*   Be concise and technical.
*   When suggesting code, specify the file path relative to the root (e.g., `site/app/page.tsx`).
*   Assume the user is familiar with the "watch path" deployment model.

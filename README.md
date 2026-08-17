# Prismma Express

This repository holds the full website platform for Prismma Express Sdn Bhd, a Malaysian logistics and courier company operating across air, sea, and land freight. It covers the public-facing homepage, the internal staff management system, and the shared backend that powers both.

## What's here

**Homepage** (`homepage/`) is the public site, built with Next.js. It covers the company's services, partners, contact form, and news portal.

**System** (`system/`) is the internal staff portal, built with React and Vite. Staff log in here to manage news publishing, module access, user accounts, and other internal operations, depending on their role.

**Backend** (`backend/`) is a single FastAPI service shared by both frontends. It is the only part of this stack that talks to the database, handling authentication, permissions, and all data access for both the public site and the internal system.

**Docker** (`docker/`) contains the Dockerfiles and nginx configuration used to build and run all three pieces together.

## Tech stack

- Homepage: Next.js, React, Tailwind CSS
- System: React, Vite, React Router
- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Database and file storage: Supabase
- Containers: Docker, with Chainguard base images

## Local development

```
cd docker
cp ../backend/.env.example ../backend/.env
cp ../homepage/.env.local.example ../homepage/.env.local
cp ../system/.env.local.example ../system/.env.local
docker compose up --build
```

The homepage is then available at `http://localhost` through the nginx edge proxy.

## Deployment

1. Point DNS for your domain, and its `app.` and `api.` subdomains, at the server
2. Update `docker/nginx/edge.conf` with the real domain names
3. Set real values in `backend/.env`, particularly `JWT_SECRET_KEY`, `DATABASE_URL`, and SMTP credentials
4. Run `docker compose -f docker/docker-compose.yml up --build -d`
5. Add SSL once DNS is confirmed working over plain HTTP

## News categories

Every published article is tagged either Malaysia or Global, matching the split shown on the public news portal. Staff set this when publishing or editing an article from the internal system, and the homepage filters accordingly.

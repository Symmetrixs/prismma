# Prismma Project

## Structure

- homepage: Next.js public site, news portal, contact, employee login entry point
- system: React and Vite internal system, asset tagging, ticketing, truck tracking, news editor
- backend: FastAPI, shared by both frontends, single source of truth
- docker: all container orchestration, Dockerfiles, and nginx configs

## Local development

    cd docker
    cp ../backend/.env.example ../backend/.env
    cp ../homepage/.env.local.example ../homepage/.env.local
    cp ../system/.env.local.example ../system/.env.local
    docker compose up --build

Homepage available at http://localhost through the nginx edge proxy, routed by hostname.

## Deployment

1. Point DNS for your-domain.com, app.your-domain.com, and api.your-domain.com at the server IP
2. Update docker/nginx/edge.conf with the real domain names
3. Set real values in backend/.env, especially JWT_SECRET_KEY, DATABASE_URL, and SMTP credentials
4. Run docker compose -f docker/docker-compose.yml up --build -d
5. Run alembic upgrade head inside the backend container to apply migrations
6. Add SSL with certbot once DNS is confirmed working over plain HTTP

## Database migrations

    docker compose exec backend alembic revision --autogenerate -m "description"
    docker compose exec backend alembic upgrade head

## News categories

Every article has a category field, either malaysia or global, matching the split on the public news portal. The system app's news editor sets this field when staff publish or edit an article. The homepage filters by category when rendering each news tab.

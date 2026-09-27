# Luxe Watches - Monorepo

This project is separated into a frontend and a backend, structured using Clean Architecture and containerized with Docker.

## Requirements
- Docker
- Docker Compose

## Getting Started

To start the entire stack (PostgreSQL, Backend API, Frontend Next.js app):

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

Check `PLAN.md` for details on the architectural roadmap.
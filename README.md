# Luxe Watches (ARIWATCH) - E-Commerce Platform

A modern, highly performant, bilingual (English & Persian) luxury watch e-commerce platform. Built with a containerized architecture utilizing Next.js, Node.js (Express), and PostgreSQL.

## Architecture & Tech Stack

This project strictly adheres to **Clean Architecture** principles on the backend and modern component-driven design on the frontend.

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Features**: Server-Side Rendering (SSR), i18n (LTL/RTL), Responsive Design

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation)
- **Database**: PostgreSQL (pg)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Services**: Frontend, Backend API, PostgreSQL Database

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Running the Project
1. Clone the repository.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. Access the applications:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:4000/api/watches](http://localhost:4000/api/watches)
   - **Database**: `localhost:5433` (mapped to internal `5432`)

### Database Seeding
The database is automatically seeded upon initialization via `backend/src/infrastructure/database/init.sql`.

## Project Structure
- `/frontend`: Next.js application.
- `/backend`: Express API utilizing Clean Architecture.
- `docker-compose.yml`: Orchestrates the microservices.

## Admin Panel
See [ADMIN_README.md](./ADMIN_README.md) for detailed information regarding the Admin Dashboard.
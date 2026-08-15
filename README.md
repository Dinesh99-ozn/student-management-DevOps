# Student Management Services — Regent College London

A simple microservices-based Student Management System.

## Stack
React + Vite · Node.js + Express · PostgreSQL · JWT + bcrypt · Jest + Supertest

## Services
| Service | Port | Responsibility |
|---|---|---|
| auth-service | 4001 | Login, JWT issuing, users/roles |
| student-service | 4002 | Student & teacher CRUD |
| academic-service | 4003 | Attendance & grades |
| frontend | 5173 (dev) / 8080 (docker) | React UI |

## Run locally (without Docker)

1. Install PostgreSQL and create a database, then load the schema and seed data:
   ```
   createdb student_management
   psql -d student_management -f database/schema.sql
   psql -d student_management -f database/seed.sql
   ```
2. For each service (`services/auth-service`, `services/student-service`, `services/academic-service`):
   ```
   cd services/auth-service
   cp .env.example .env
   npm install
   npm start
   ```
   Repeat for the other two services.
3. Frontend:
   ```
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Open http://localhost:5173

## Run with Docker (recommended)

```
cp .env.example .env
docker compose up --build
```
- Frontend: http://localhost:8080
- auth-service: http://localhost:4001/health
- student-service: http://localhost:4002/health
- academic-service: http://localhost:4003/health

The Postgres container automatically runs `database/schema.sql` and `database/seed.sql` on first startup.

## Run tests

Each backend service has its own test suite (DB is mocked, no live Postgres needed):
```
cd services/auth-service && npm install && npm test
cd services/student-service && npm install && npm test
cd services/academic-service && npm install && npm test
```

## Demo login accounts

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Teacher | teacher1 | teacher123 |
| Teacher | teacher2 | teacher123 |
| Student | student1 | student123 |
| Student | student2 | student123 |
| Student | student3 | student123 |
| Student | student4 | student123 |
| Student | student5 | student123 |

## Connecting to DevOps later

- **CodeCommit**: push this repo as-is; each service already has its own `package.json` and `Dockerfile`, so no restructuring is needed.
- **CodeBuild**: add a `buildspec.yml` per service (or one at root building all four) that runs `npm install`, `npm test`, then `docker build`.
- **Jenkins**: point a pipeline job at this repo; stages = install → test → docker build → push to ECR.
- **Elastic Beanstalk**: use the multi-container Docker platform with a `Dockerrun.aws.json` (or migrate `docker-compose.yml` into EB's multi-container format) referencing the four built images; point `DB_HOST` env vars at an RDS PostgreSQL instance instead of the local `postgres` container.
- **Environment variables**: every service already reads all config from `.env` — in AWS, set the same variables via Elastic Beanstalk's environment configuration instead of `.env` files.

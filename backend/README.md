# JWT Authentication API

A FastAPI Web API that implements JWT (JSON Web Token) authentication with login and token refresh endpoints.

## Tech Stack

| Component        | Version           |
| ---------------- | ----------------- |
| Python           | 3.11+             |
| FastAPI          | 0.111+            |
| Uvicorn          | 0.29+             |
| python-jose      | 3.3+              |
| passlib + bcrypt | 1.7.x + ≥3.2,<4.0 |
| Pydantic         | 2.x               |
| Poetry           | 1.8+              |

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py        # FastAPI app entry point
│   ├── config.py      # Settings (SECRET_KEY, algorithm, expiration)
│   ├── models.py      # Pydantic schemas
│   ├── auth.py        # Password hashing + JWT logic
│   └── routes.py      # /token and /token/refresh endpoints
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Prerequisites

- Python 3.11+
- [Poetry](https://python-poetry.org/docs/#installation)
- Docker & Docker Compose (for containerized deployment)

---

## Local Development

### 1. Install dependencies

```bash
cd backend
poetry install
```

### 2. Run the development server

```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs (Swagger UI) at `http://localhost:8000/docs`.

### 3. (Optional) Set a custom secret key

```bash
export SECRET_KEY="your-secure-random-secret"
poetry run uvicorn app.main:app --reload
```

---

## Docker Deployment

### Build and start the container

```bash
cd backend
docker-compose up --build
```

### Run in detached mode

```bash
docker-compose up -d --build
```

### Stop the container

```bash
docker-compose down
```

### Override the secret key via environment variable

```bash
SECRET_KEY="your-secure-random-secret" docker-compose up --build
```

---

## API Reference

### Health Check

```http
GET /health
```

**Response**

```json
{ "status": "ok" }
```

---

### Login — Obtain a JWT

```http
POST /token
Content-Type: application/json
```

**Request body**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

**Error (401)** — wrong credentials

```json
{ "detail": "Incorrect username or password" }
```

**curl example**

```bash
curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | python3 -m json.tool
```

---

### Refresh Token

```http
POST /token/refresh
Authorization: Bearer <current_token>
```

Returns a **new** token with a fresh 300-second expiration. The provided token must be valid and not expired.

**Response**

```json
{
  "access_token": "<new_jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

**Error (401)** — invalid or expired token

```json
{ "detail": "Invalid or expired token" }
```

**curl example**

```bash
# 1. Login and capture the token
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 2. Refresh the token
curl -s -X POST http://localhost:8000/token/refresh \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## Token Details

| Property                | Value                   |
| ----------------------- | ----------------------- |
| Algorithm               | HS256                   |
| Expiration              | 300 seconds (5 minutes) |
| Claim used for identity | `sub` (subject)         |

The secret key defaults to a built-in value for local development. **Always set a strong `SECRET_KEY` environment variable in production.**

---

## Default Credentials

| Username | Password   |
| -------- | ---------- |
| `admin`  | `admin123` |

> Passwords are hashed with bcrypt via passlib. The bcrypt dependency is pinned to `>=3.2,<4.0` for compatibility with passlib 1.7.x.

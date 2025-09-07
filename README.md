# Learn NestJS CRUD Project

This is a backend CRUD API project built with [NestJS](https://nestjs.com/). It demonstrates authentication, user management, and basic RESTful operations using modern Node.js best practices.

## Features

- User authentication (JWT & Local strategy)
- User CRUD operations
- Passport integration
- Environment-based configuration
- EJS view rendering

## Getting Started

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/leducvinhh/learn-nestjs.git
cd crud
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=
MONGODB_URL=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=
```

### Running the Project

```bash
npm run dev
```

The server will start at `http://localhost:8000` by default.

## API Endpoints

- `POST /login` — User login
- `GET /profile` — Get authenticated user profile (JWT required)
- `GET /users` — List users
- `POST /users` — Create user
- `PUT /users/:id` — Update user
- `DELETE /users/:id` — Delete user

## Project Structure

- `src/` — Source code
- `public/` — Static assets
- `views/` — EJS templates
- `test/` — Test files

## Useful Commands

- `npm run dev` — Start development server
- `npm run test` — Run tests

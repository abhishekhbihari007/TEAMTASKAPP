# TeamTask App

A full-stack team project and task management platform built with React, Node.js, and MongoDB.

## Features

- **Role-Based Access** — Separate admin and member roles with enforced permissions
- **Project Management** — Admins can create projects and assign members
- **Task Tracking** — Create tasks, assign to members, set priority and due dates
- **Member Dashboard** — Members see all tasks across their assigned projects
- **Admin Dashboard** — Admins get a full view of all tasks across all projects
- **Live Status Updates** — Update task status (To Do / In Progress / Completed) inline
- **Error Handling** — Global error handler with try/catch on all routes

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |

## Project Structure

```
TeamTask/
├── backend/
│   ├── server.ts        # Express server, models, routes
│   ├── seedAdmin.ts     # Seeds default admin user
│   └── seedMembers.ts   # Seeds demo member accounts
├── client/
│   ├── src/
│   │   ├── pages/       # Dashboard, Projects, ProjectDetails, Login, Register
│   │   ├── contexts/    # AuthContext (JWT + localStorage)
│   │   └── lib/         # API helper
│   └── components/ui/   # shadcn/ui components
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/abhishekhbihari007/TEAMTASKAPP.git
   cd TEAMTASKAPP
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the dev server
   ```bash
   npm run dev
   ```

   App runs at `http://localhost:3000`

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@task.io` | `admin123` |
| Member | Register via `/register` | — |

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new member |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/projects` | JWT | List user's projects |
| POST | `/api/projects` | Admin | Create project |
| PATCH | `/api/projects/:id` | Admin | Update / assign members |
| GET | `/api/tasks` | JWT | Tasks by project |
| GET | `/api/tasks/dashboard` | JWT | Dashboard tasks |
| POST | `/api/tasks` | JWT | Create task |
| PATCH | `/api/tasks/:id` | JWT | Update task status |
| GET | `/api/users` | JWT | List all users |

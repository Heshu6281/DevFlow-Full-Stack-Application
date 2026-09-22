# DevFlow – Developer Productivity Platform

DevFlow is a full-stack developer productivity and project management application that helps users manage projects, tasks, productivity, activities, analytics, profile information, settings, notifications, and AI-assisted project planning.

## Features

- User registration and login
- JWT-based authentication
- User-specific data isolation
- Project management
- Task management
- Task status and progress tracking
- Task priority management
- Dashboard productivity overview
- Activity timeline
- Productivity analytics
- Project progress analytics
- Priority distribution analytics
- AI-powered project and task generation
- Save AI-generated projects and tasks
- User profile management
- Skills management
- Notification management
- Application settings
- Password/security management
- Responsive UI
- Light/dark theme support

## Tech Stack

### Frontend

- React.js
- Vite
- JavaScript / TypeScript
- React Router
- Tailwind CSS
- Lucide React
- Recharts

### Backend

- Node.js
- Express.js
- MySQL
- JWT
- Joi
- bcrypt
- dotenv
- CORS

### AI

- Google Gemini API

## Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│          Vite + UI           │
└──────────────┬───────────────┘
               │
               │ REST API / JWT
               ▼
┌──────────────────────────────┐
│      Node.js + Express       │
│      Authentication/API      │
└──────────────┬───────────────┘
               │
               │ SQL Queries
               ▼
┌──────────────────────────────┐
│            MySQL             │
│       Persistent Data        │
└──────────────────────────────┘
Main Modules
Dashboard

Provides an overview of:

Total projects
Total tasks
Completed tasks
Task progress
Workspace productivity
Recent activity
Projects

Users can:

Create projects
View projects
Update projects
Delete projects
Track project progress
Manage project technologies
Tasks

Users can:

Create tasks
Update tasks
Delete tasks
Change task status
Track task progress
Set priorities
Set due dates
Analytics

The analytics dashboard provides:

Task completion statistics
Priority distribution
Project progress
Average task progress
Productivity trends
Completed vs pending information
Activity

Displays project and task-related activity for the authenticated user.

AI Assistant

The AI Assistant can generate project plans and tasks using Google Gemini.

Generated projects and selected tasks can be saved through the backend and persisted in MySQL.

Profile

Users can manage/view:

Name
Email
Role
Skills
Skill proficiency
Settings

Users can manage application preferences and notification settings.

Database

The application uses MySQL for persistent storage.

Main database entities include:

Users
Projects
Tasks
User Settings
User Skills
Notification Read States

Projects belong to users, and tasks belong to projects.

Environment Variables

Create a .env file in the backend directory.

Example:

PORT=5000

DB_HOST=localhost
DB_PORT=3300
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=devflow

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

Do not commit the actual .env file to GitHub.

Installation
1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd DevFlow
2. Backend
cd backend
npm install

Configure the .env file and create the database using:

database/schema.sql

Optional sample data can be loaded using:

database/seed.sql

Start the backend:

npm start

The backend runs on:

http://localhost:5000
3. Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:5173
Authentication

DevFlow uses JWT authentication.

After login, the authentication token is stored on the client and included in protected API requests.

Protected resources are associated with the authenticated user's ID to maintain data isolation.

Demo

The application demonstrates:

User authentication
Dashboard overview
Project management
Task management
Activity tracking
Analytics
AI project/task generation
Profile management
Settings
Notifications
User data isolation
Logout
Project Structure
DevFlow/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── app.js
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
Future Improvements
Production deployment
Advanced team collaboration
Real-time notifications
More AI productivity features
Advanced reporting
Team-level analytics
Author

Heshwanthini Pasunuthi

DevFlow – Full Stack Development Project


## `.gitignore`

At the root, make sure you have:

```gitignore
node_modules/
.env
*.log
dist/
build/
.vite/
.DS_Store

Do not upload your .env, especially because it contains your MySQL password, JWT secret, and Gemini API key.
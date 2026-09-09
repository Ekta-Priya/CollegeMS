# College Management System

This repository is being built as a portfolio-ready college management application with a role-based architecture, a secure backend, and a clean frontend structure.

## Goal
Build a production-style full-stack project with:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express.js + TypeScript
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt with role embedded in the JWT payload
- Deployment target: Vercel (frontend), Render/Railway (backend), MongoDB Atlas
- Free-tier services only, no paid APIs

## Role hierarchy
Admin -> HOD -> Teacher -> Student

Each role has a different dashboard and different permissions, enforced on the backend via middleware, not only by UI hiding.

## Project folder structure

```bash
college-management-system/
├─ client/                 # React + Vite + Tailwind frontend
│  ├─ src/
│  ├─ public/
│  └─ package.json
├─ server/                 # Express + TypeScript backend
│  ├─ src/
│  │  ├─ config/
│  │  ├─ models/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ controllers/
│  │  └─ server.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ .env
│  └─ .env.example
├─ README.md
├─ .gitignore
└─ package.json (optional root scripts)
```

## Step-by-step build plan

### Step 1: Backend foundation
- Set up the Express + TypeScript server structure
- Configure MongoDB connection and environment variables
- Create Mongoose schemas and TypeScript interfaces for all core models
- Keep TypeScript relaxed initially so development moves quickly

### Step 2: Shared auth infrastructure
- User registration and login for Admin, HOD, Teacher, and Student
- Password hashing with bcrypt
- JWT generation and verification
- Role-based middleware for protected routes
- Profile update flow with optional photo support

### Step 3: Backend role modules
- Admin module: manage HODs, departments, system stats, read-only cross-department access
- HOD module: manage teachers, subjects, classes, attendance summaries, leave approvals
- Teacher module: attendance, grading, notices, leave requests
- Student module: timetable, attendance, report cards, notices, subject views

### Step 4: Frontend dashboards
After each backend module is verified, build the corresponding React dashboard and protected routes for that role.

### Step 5: Deployment preparation
- Frontend on Vercel
- Backend on Render or Railway
- Database on MongoDB Atlas
- Use only free-tier services

## Core data models
- User
- Department
- Subject
- Class
- Attendance
- Grade
- Notice
- LeaveRequest

## Functional requirements
### Shared
- Registration/login for all roles
- Password hashing
- JWT sessions with role embedded in token payload
- Backend-enforced authorization using middleware
- Protected frontend routes per role
- Editable profile with contact details and optional profile photo

### Admin
- Add/edit/deactivate HOD accounts
- Assign HOD to department
- Add/edit/deactivate departments
- View system-wide statistics
- Read all departmental data
- Approve/reject HOD requests

### HOD
- Manage teachers in the department
- Create and manage subjects and classes
- Assign teachers to subjects and classes
- Review attendance and grade summary data
- Approve teacher leave or timetable requests
- View department-level analytics

### Teacher
- View assigned students/classes/subjects
- Mark daily attendance
- Enter and update grades
- View attendance and grade history
- Post subject notices
- Submit leave or timetable requests

### Student
- View timetable and class schedule
- View personal attendance with percentage
- View report card and subject grades
- View staff and subject information
- Read notices and announcements

## Implementation style
- Use backend middleware for authorization, not just hidden UI elements
- Keep TypeScript relaxed early for speed and interview-friendly development
- Build one module at a time and verify each stage before moving on
- Favor clean, explainable code with simple architecture

## Current milestone
This repository is currently in Step 1: backend structure, database connection, and Mongoose/TypeScript model definitions are being finalized and verified.

## Local setup
1. In the `server` folder, copy `.env.example` to `.env` and update the values if needed.
2. Start MongoDB locally or use MongoDB Atlas.
3. Install dependencies in both apps:
   
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. Run the backend:
   
   ```bash
   cd server
   npm run dev
   ```

5. Run the frontend:
   
   ```bash
   cd client
   npm run dev
   ```

6. Or run both together from the project root:
   
   ```bash
   npm install
   npm run dev
   ```

## Demo login accounts
To populate sample data quickly, run:

```bash
cd server
npm run seed
```

Then log in with any of these accounts:

- Admin: `admin@college.edu` / `Admin@123`
- HOD: `hod@college.edu` / `Hod@123`
- Teacher: `teacher@college.edu` / `Teacher@123`
- Student: `student@college.edu` / `Student@123`

## MongoDB setup
Use your Atlas connection string in the `.env` file inside the `server` folder:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/college_management_system
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_this_with_a_secure_secret
```

The project is configured to use the database name `college_management_system`, which keeps the application consistent across local development and deployment.

## Deployment-ready setup
This project is structured for a simple free-tier deployment stack:

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas

Recommended environment variables:

### Server production variables
```env
PORT=10000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/college_management_system
CLIENT_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your_secure_random_secret
```

### Client production variables
```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

Create a `client/.env.example` file with the same key so GitHub pushes remain safe and easy to reproduce.

## GitHub push checklist
Before pushing to GitHub:

1. Ensure `.env` files are not tracked.
2. Ensure `node_modules`, `dist`, and editor files are ignored.
3. Commit only source files and config files.
4. Push the repository and then add environment variables in the deployment platform.

Example:

```bash
git init
git add .
git commit -m "Initial portfolio project commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

This keeps secrets out of GitHub while still allowing the app to be deployed securely in the cloud.

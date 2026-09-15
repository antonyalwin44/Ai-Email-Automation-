# 🚀 AI-Powered Employee Event Email Automation System

> A full-stack HR automation platform that uses **Google Gemini AI** to generate personalized event invitation emails and sends them via **Gmail SMTP** — built as an MCA Mini Project.

---

## 📸 Features

- 🔐 **Secure Admin Authentication** — JWT + bcrypt, protected dashboard routes
- 👥 **Employee Management** — Full CRUD with search, filter by department, pagination, CSV export
- 📅 **Event Management** — Create/Edit/Delete company events with types (Annual Day, Workshop, Festival, etc.)
- 🤖 **Gemini AI Email Generator** — Auto-generates professional invitation emails
- 📧 **Bulk Email Sending** — Nodemailer + Gmail SMTP, send to All / By Department / Individual
- 📊 **Email Logs & Tracking** — Track Sent / Pending / Failed emails with status badges
- 📈 **HR Dashboard** — Stats cards, recent activity, quick actions

---

## 🛠️ Technology Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | Next.js 14, React, Tailwind CSS   |
| Backend      | Node.js, Express.js               |
| Database     | MySQL                             |
| AI Service   | Google Gemini API (gemini-1.5-flash) |
| Email        | Nodemailer + Gmail SMTP           |
| Auth         | JWT + bcrypt                      |
| Icons        | Lucide React                      |
| HTTP Client  | Axios                             |

---

## 📁 Folder Structure

```
AI Email automation/
├── frontend/                  # Next.js 14 App Router
│   ├── app/
│   │   ├── login/             # Login page
│   │   ├── dashboard/         # Protected dashboard
│   │   │   ├── employees/     # Employee CRUD
│   │   │   ├── events/        # Event CRUD
│   │   │   ├── email/         # AI email campaign
│   │   │   ├── logs/          # Email logs
│   │   │   └── settings/      # Settings
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # API client
│
├── backend/                   # Express.js REST API
│   ├── controllers/           # Business logic
│   ├── routes/                # API route definitions
│   ├── middleware/            # JWT auth middleware
│   └── config/                # Database connection
│
└── database/
    └── schema.sql             # MySQL schema + seed data
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Google Gemini API Key ([Get here](https://aistudio.google.com/app/apikey))
- Gmail Account with App Password ([Setup guide](#gmail-smtp-setup))

---

### 1. Clone / Open the Project

```bash
cd "D:\AI Email automation"
```

---

### 2. MySQL Database Setup

Open MySQL Workbench or MySQL CLI and run:

```sql
SOURCE database/schema.sql;
```

Or via CLI:
```bash
mysql -u root -p < database/schema.sql
```

This creates the `email_automation` database with all tables and sample data.

---

### 3. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file:
```bash
copy .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=email_automation
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create env file:
```bash
copy .env.local.example .env.local
```

The `.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Default Admin Credentials

| Field    | Value                |
|----------|----------------------|
| Email    | admin@company.com    |
| Password | admin123             |

---

## 🤖 Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key and paste it as `GEMINI_API_KEY` in `backend/.env`

---

## 📧 Gmail SMTP Setup

To send real emails, you need a Gmail **App Password** (NOT your regular password):

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Create new app password
4. Select **Mail** → **Windows Computer** → Generate
5. Copy the 16-character password
6. Set in `backend/.env`:
   ```
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```

> **Note**: Remove spaces from the app password when pasting into .env

---

## 🗃️ Database Schema

| Table        | Description                              |
|--------------|------------------------------------------|
| `admins`     | Admin accounts with hashed passwords     |
| `employees`  | Employee records with department/status  |
| `events`     | Company events with date, time, venue    |
| `email_logs` | Email send history with status tracking  |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| POST   | `/api/auth/login`  | Admin login     |
| POST   | `/api/auth/logout` | Logout          |
| GET    | `/api/auth/me`     | Get current admin |

### Employees
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | `/api/employees`        | List (search/filter) |
| GET    | `/api/employees/active` | All active employees |
| POST   | `/api/employees`        | Create employee      |
| PUT    | `/api/employees/:id`    | Update employee      |
| DELETE | `/api/employees/:id`    | Delete employee      |

### Events
| Method | Endpoint            | Description    |
|--------|---------------------|----------------|
| GET    | `/api/events`       | List events    |
| POST   | `/api/events`       | Create event   |
| PUT    | `/api/events/:id`   | Update event   |
| DELETE | `/api/events/:id`   | Delete event   |

### Email
| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| POST   | `/api/email/generate-email`  | Generate AI email        |
| POST   | `/api/email/send-email`      | Send bulk emails         |

### Logs
| Method | Endpoint                   | Description         |
|--------|----------------------------|---------------------|
| GET    | `/api/logs`                | Email logs          |
| GET    | `/api/logs/dashboard-stats`| Dashboard stats     |

---

## 🖥️ Pages

| Page                   | Route                              |
|------------------------|------------------------------------|
| Login                  | `/login`                           |
| Dashboard              | `/dashboard`                       |
| Employee List          | `/dashboard/employees`             |
| Add Employee           | `/dashboard/employees/add`         |
| Edit Employee          | `/dashboard/employees/[id]/edit`   |
| Event List             | `/dashboard/events`                |
| Create Event           | `/dashboard/events/create`         |
| Edit Event             | `/dashboard/events/[id]/edit`      |
| AI Email Campaign      | `/dashboard/email`                 |
| Email Logs             | `/dashboard/logs`                  |
| Settings               | `/dashboard/settings`              |

---

## 🚀 Running Commands

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

Then open: **http://localhost:3000**

---

## 🎓 MCA Mini Project

**Subject**: Web Application Development / Full Stack Development  
**Tech Stack**: Next.js · Express.js · MySQL · Gemini AI · Nodemailer  
**Features**: AI-powered email generation, CRUD operations, JWT auth, bulk email  

---

*Built with ❤️ for MCA Mini Project demonstration*

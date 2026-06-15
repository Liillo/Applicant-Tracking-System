# Applicant Tracking System (ATS)

## Description
A web-based Applicant Tracking System that allows organizations to post job vacancies, receive applications, and manage applicants through a centralized recruitment platform.
This specific ATS was designed with HRMPEB in mind.

## Features
- Job posting management
- Online job applications
- Resume upload system
- Applicant tracking
- Admin dashboard

## Technologies
- Node.js
- JavaScript
- Prisma ORM
- MySQL/MariaDB via Wampserver
- HTML, CSS

## Installation

1. Clone repository

git clone https://github.com/Liillo/Applicant-Tracking-System.git

2. Install dependencies

npm install

3. Configure Wampserver database

Start Wampserver, open phpMyAdmin, and create a database named `hrmpeb_ats`.

4. Configure environment variables

Create `apps/api/.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/hrmpeb_ats"
PORT=3001
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
```

If your Wampserver MySQL user has a password, put it after `root:` in `DATABASE_URL`.

5. Create the database tables

```bash
npm exec prisma db push --workspace api
npm run seed:api
```

6. Run the project

```bash
npm run dev
```

## Author
Lilian Kazuri

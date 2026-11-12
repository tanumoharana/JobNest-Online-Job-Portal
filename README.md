# JobNest-Online-Job-Portal
JobNest is an Online Job Application Portal that connects job seekers with career opportunities. Users can register, log in, search for jobs, upload resumes, apply for openings, and track application status. Admins can manage job listings, view applications, and update their status. Built using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

# JobNest - Online Job Application Portal

## About the Project

JobNest is a web-based Online Job Application Portal designed to make the job search and application process easier.

It allows job seekers to explore available job opportunities, create an account, log in, and apply for jobs by submitting their resumes.

The portal also provides an admin section where administrators can add new jobs, manage existing job listings, view applications, and update application statuses.

The main goal of JobNest is to connect job seekers with career opportunities through a simple and user-friendly platform.

## Features

### For Job Seekers
- User registration and login.
- Browse available job opportunities.
- Search jobs by title and location.
- Apply for jobs by uploading a resume.
- Add a cover letter while applying.
- View submitted applications.
- Track application status.
- View and manage profile details.

### For Admin
- Secure admin login.
- Add new job openings.
- Edit and delete job listings.
- View applications submitted by users.
- Download applicant resumes.
- Update application status (Pending, Accepted, Rejected).
- View admin account details.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Creates webpage structure |
| CSS | Designs and styles the website |
| JavaScript | Handles user interactions |
| Node.js | Runs the backend server |
| Express.js | Handles API requests |
| MySQL | Stores user, job and application data |
| XAMPP | Provides the local MySQL database environment |
| VS Code | Used for development |

## Project Structure

```text
JobNest/
│
├── backend/
│   ├── uploads/
│   ├── db.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── apply.html
    ├── my-applications.html
    ├── profile.html
    ├── admin-login.html
    ├── admin-dashboard.html
    ├── admin-account.html
    ├── manage-jobs.html
    ├── admin-applications.html
    ├── script.js
    └── style.css
```

## How to Run the Project

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Install Node.js and XAMPP.
4. Start MySQL from the XAMPP Control Panel.
5. Open phpMyAdmin and create a database named `online_job_portal`.
6. Create the required database tables.
7. Configure the database connection details in the backend `.env` file.
8. Open the terminal in the project folder.
9. Install the required backend packages:

```bash
cd backend
npm install
```

10. Start the backend server:

```bash
node server.js
```

11. Open `frontend/index.html` using Live Server.

The JobNest home page should now be accessible in your browser.

## Application Workflow

1. A new user registers or an existing user logs in.
2. The user explores available job openings.
3. The user selects a suitable job and submits an application.
4. The application and resume details are stored in the database.
5. The admin views the submitted applications.
6. The admin updates the application status.
7. The user can check the updated status in the My Applications section.

## Future Enhancements

- Email notifications for application updates.
- Forgot password functionality.
- Advanced job filtering.
- Company and recruiter accounts.
- Improved user profile management.

## Project Purpose

This project was developed as part of learning Full Stack Web Development. It demonstrates how frontend technologies, backend development, APIs, and database management work together to build a functional web application.

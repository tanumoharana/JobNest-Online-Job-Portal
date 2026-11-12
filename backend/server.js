const multer = require("multer");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();

// Resume upload configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename = Date.now() + "-" +
            Math.round(Math.random() * 1000000) + extension;

        cb(null, filename);
    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedExtensions = [".pdf", ".doc", ".docx"];

        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, DOC and DOCX files are allowed"));
        }

    }

});

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("Online Job Application Server is Running!");
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) {
            return res.status(500).send("Database connection failed");
        }

        res.send("Database connected successfully!");
    });
});

// Registration API
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "Please fill in all fields"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password_hash, phone)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
    sql,
    [name.trim(), email.trim(), passwordHash, phone.trim()],
    (err, result) => {
            if (err) {
                console.error("Registration database error:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "This email is already registered"
                    });
                }

                return res.status(500).json({
                    message: "Registration failed"
                });
            }

            res.status(201).json({
                message: "Registration successful!",
                userId: result.insertId
            });
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// Login API
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter email and password"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email.trim()], async (err, results) => {

        if (err) {
            console.error("Login database error:", err);

            return res.status(500).json({
                message: "Login failed. Please try again."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Email is not registered"
            });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        res.status(200).json({
            message: "Login successful! Welcome, " + user.name,
            userId: user.id,
            name: user.name
        });

    });

});

// Get all available jobs
app.get("/api/jobs", (req, res) => {

    const sql = "SELECT * FROM jobs ORDER BY created_at DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get jobs error:", err);

            return res.status(500).json({
                message: "Unable to fetch jobs"
            });
        }

        res.status(200).json(results);

    });

});
app.get("/api/profile/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT id, name, email, phone
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("Profile error:", err);

            return res.status(500).json({
                message: "Unable to fetch profile"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(results[0]);

    });

});


// Submit job application API
app.post("/api/apply", upload.single("resume"), (req, res) => {

    const { userId, jobId, coverLetter } = req.body;

    if (!userId || !jobId || !coverLetter) {
        return res.status(400).json({
            message: "Please fill in all required fields"
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "Please upload your resume"
        });
    }

    const sql = `
        INSERT INTO applications
        (user_id, job_id, resume_path, status, cover_letter)
        VALUES (?, ?, ?, ?, ?)
    `;

    const resumePath = "uploads/" + req.file.filename;

    db.query(
        sql,
        [userId, jobId, resumePath, "Pending", coverLetter],
        (err, result) => {

            if (err) {
                console.error("Application error:", err);

                return res.status(500).json({
                    message: "Unable to submit application"
                });
            }

            res.status(201).json({
                message: "Application submitted successfully!",
                applicationId: result.insertId
            });

        }
    );

});

// Get applications submitted by a specific user
app.get("/api/my-applications/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            applications.id,
            jobs.title,
            jobs.company,
            jobs.location,
            applications.status,
            applications.applied_at,
            applications.resume_path,
            applications.cover_letter
        FROM applications
        JOIN jobs
        ON applications.job_id = jobs.id
        WHERE applications.user_id = ?
        ORDER BY applications.applied_at DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("My Applications error:", err);

            return res.status(500).json({
                message: "Unable to fetch applications"
            });
        }

        res.status(200).json(results);

    });

});
// Admin Add Job API
app.post("/api/admin/jobs", (req, res) => {

    const { title, company, location, description, salary } = req.body;

    if (!title || !company || !location || !description) {
        return res.status(400).json({
            message: "Please fill in all required fields"
        });
    }

    const sql = `
        INSERT INTO jobs (title, company, location, description, salary)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title.trim(),
            company.trim(),
            location.trim(),
            description.trim(),
            salary || null
        ],
        (err, result) => {

            if (err) {
                console.error("Add job error:", err);

                return res.status(500).json({
                    message: "Unable to add job"
                });
            }

            res.status(201).json({
                message: "Job added successfully!",
                jobId: result.insertId
            });

        }
    );

});
// Admin View All Jobs API
app.get("/api/admin/jobs", (req, res) => {

    const sql = "SELECT * FROM jobs ORDER BY created_at DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Admin get jobs error:", err);

            return res.status(500).json({
                message: "Unable to fetch jobs"
            });
        }

        res.status(200).json(results);

    });

});

// Admin View All Applications API
app.get("/api/admin/applications", (req, res) => {

    const sql = `
        SELECT
            applications.id,
            users.name AS applicant_name,
            users.email,
            users.phone,
            jobs.title AS job_title,
            jobs.company,
            jobs.location,
            applications.resume_path,
            applications.status,
            applications.applied_at,
            applications.cover_letter
        FROM applications
        JOIN users ON applications.user_id = users.id
        JOIN jobs ON applications.job_id = jobs.id
        ORDER BY applications.applied_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Admin applications error:", err);

            return res.status(500).json({
                message: "Unable to fetch applications"
            });
        }

        res.status(200).json(results);

    });

});


// Admin Update Application Status API
app.put("/api/admin/applications/:id/status", (req, res) => {

    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Accepted", "Rejected"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid application status"
        });
    }

    const sql = `
        UPDATE applications
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, applicationId], (err, result) => {

        if (err) {
            console.error("Status update error:", err);

            return res.status(500).json({
                message: "Unable to update application status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application status updated successfully!"
        });

    });

});

// Admin Edit Job API
app.put("/api/admin/jobs/:id", (req, res) => {

    const { title, company, location, description, salary } = req.body;
    const jobId = req.params.id;

    if (!title || !company || !location || !description) {
        return res.status(400).json({
            message: "Please fill in all required fields"
        });
    }

    const sql = `
        UPDATE jobs
        SET title = ?, company = ?, location = ?,
            description = ?, salary = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title.trim(),
            company.trim(),
            location.trim(),
            description.trim(),
            salary || null,
            jobId
        ],
        (err, result) => {

            if (err) {
                console.error("Edit job error:", err);
                return res.status(500).json({
                    message: "Unable to update job"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Job not found"
                });
            }

            res.status(200).json({
                message: "Job updated successfully!"
            });
        }
    );

});
// Admin Delete Job API
app.delete("/api/admin/jobs/:id", (req, res) => {

    const jobId = req.params.id;

    const sql = "DELETE FROM jobs WHERE id = ?";

    db.query(sql, [jobId], (err, result) => {

        if (err) {
            console.error("Delete job error:", err);
            return res.status(500).json({
                message: "Unable to delete job"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json({
            message: "Job deleted successfully!"
        });

    });

});
 // Admin Login API
app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter email and password"
        });
    }

    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email.trim()], async (err, results) => {

        if (err) {
            console.error("Admin login error:", err);

            return res.status(500).json({
                message: "Admin login failed"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Admin account not found"
            });
        }

        const admin = results[0];

        const isMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        res.status(200).json({
            message: "Admin login successful!",
            adminId: admin.id,
            name: admin.name
        });

    });

});


// Admin Account Details API
app.get("/api/admin/profile/:adminId", (req, res) => {

    const adminId = req.params.adminId;

    const sql = `
        SELECT id, name, email
        FROM admins
        WHERE id = ?
    `;

    db.query(sql, [adminId], (err, results) => {

        if (err) {
            console.error("Admin profile error:", err);

            return res.status(500).json({
                message: "Unable to fetch admin details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json(results[0]);

    });

});


// Admin Account Details API
app.get("/api/admin/profile/:adminId", (req, res) => {

    const adminId = req.params.adminId;

    const sql = `
        SELECT id, name, email
        FROM admins
        WHERE id = ?
    `;

    db.query(sql, [adminId], (err, results) => {

        if (err) {
            console.error("Admin profile error:", err);
            return res.status(500).json({
                message: "Unable to fetch admin account"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json(results[0]);

    });

});
app.listen(3000, () => {
    console.log("Online Job Application Server is Running!");
});

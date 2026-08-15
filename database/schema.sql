-- Student Management Services - Database Schema
-- Single shared PostgreSQL database used by all backend microservices.

-- Users table: holds login credentials + role for every person in the system.
-- role determines what a user can access (admin / teacher / student).
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Teachers table: profile data for teacher users, linked back to users.
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Students table: profile data for student users, linked back to users.
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    dob DATE,
    class VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance records, one row per student per date.
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_by INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Grades records, one row per student per subject/term.
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    term VARCHAR(50) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    marked_by INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW()
);

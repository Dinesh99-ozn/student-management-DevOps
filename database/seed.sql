-- Seed data for Student Management Services
-- Demo passwords (plain text, for README only):
--   admin    -> admin123
--   teacher1/teacher2 -> teacher123
--   student1..student5 -> student123

-- Clear existing data (safe for repeated seeding in dev)
TRUNCATE TABLE grades, attendance, students, teachers, users RESTART IDENTITY CASCADE;

-- 1 Admin
INSERT INTO users (username, password_hash, role, full_name, email) VALUES
('admin', '$2b$10$VAlI4ecXH.NMs3SfWSraMuNGFezhPDfvEXjT.WkrO9ckTR.d3QlC6', 'admin', 'System Admin', 'admin@regent.ac.uk');

-- 2 Teachers
INSERT INTO users (username, password_hash, role, full_name, email) VALUES
('teacher1', '$2b$10$agAcXj3mXKp7JINbNQ7UpO2xmRzUF1jdVNxwigmPKXQCmIYStAmkK', 'teacher', 'John Smith', 'john.smith@regent.ac.uk'),
('teacher2', '$2b$10$agAcXj3mXKp7JINbNQ7UpO2xmRzUF1jdVNxwigmPKXQCmIYStAmkK', 'teacher', 'Sarah Johnson', 'sarah.johnson@regent.ac.uk');

INSERT INTO teachers (user_id, name, email, subject) VALUES
(2, 'John Smith', 'john.smith@regent.ac.uk', 'Mathematics'),
(3, 'Sarah Johnson', 'sarah.johnson@regent.ac.uk', 'Computer Science');

-- 5 Students
INSERT INTO users (username, password_hash, role, full_name, email) VALUES
('student1', '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC', 'student', 'Alice Brown', 'alice.brown@student.regent.ac.uk'),
('student2', '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC', 'student', 'Bob Davis', 'bob.davis@student.regent.ac.uk'),
('student3', '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC', 'student', 'Charlie Evans', 'charlie.evans@student.regent.ac.uk'),
('student4', '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC', 'student', 'Diana Foster', 'diana.foster@student.regent.ac.uk'),
('student5', '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC', 'student', 'Ethan Green', 'ethan.green@student.regent.ac.uk');

INSERT INTO students (user_id, name, email, dob, class) VALUES
(4, 'Alice Brown', 'alice.brown@student.regent.ac.uk', '2003-05-14', 'CS101'),
(5, 'Bob Davis', 'bob.davis@student.regent.ac.uk', '2002-11-02', 'CS101'),
(6, 'Charlie Evans', 'charlie.evans@student.regent.ac.uk', '2003-02-20', 'CS102'),
(7, 'Diana Foster', 'diana.foster@student.regent.ac.uk', '2002-07-09', 'CS102'),
(8, 'Ethan Green', 'ethan.green@student.regent.ac.uk', '2003-09-30', 'CS101');

-- Sample attendance (marked_by references teachers.id)
INSERT INTO attendance (student_id, date, status, marked_by) VALUES
(1, '2026-08-01', 'present', 1),
(1, '2026-08-02', 'absent', 1),
(2, '2026-08-01', 'present', 1),
(3, '2026-08-01', 'late', 2),
(4, '2026-08-01', 'present', 2),
(5, '2026-08-01', 'present', 1);

-- Sample grades
INSERT INTO grades (student_id, subject, term, grade, marked_by) VALUES
(1, 'Mathematics', 'Term 1', 'A', 1),
(2, 'Mathematics', 'Term 1', 'B', 1),
(3, 'Computer Science', 'Term 1', 'A', 2),
(4, 'Computer Science', 'Term 1', 'C', 2),
(5, 'Mathematics', 'Term 1', 'B', 1);

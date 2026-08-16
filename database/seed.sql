-- Seed data for Student Management Services
-- Demo passwords:
--   admin -> admin123
--   teacher1/teacher2/teacher3 -> teacher123
--   student1..student9 -> student123

-- Clear existing data
TRUNCATE TABLE grades, attendance, students, teachers, users
RESTART IDENTITY CASCADE;


-- =========================================================
-- 1. ADMIN
-- =========================================================

INSERT INTO users
(username, password_hash, role, full_name, email)
VALUES
(
    'admin',
    '$2b$10$VAlI4ecXH.NMs3SfWSraMuNGFezhPDfvEXjT.WkrO9ckTR.d3QlC6',
    'admin',
    'System Admin',
    'admin@regent.ac.uk'
);


-- =========================================================
-- 2. TEACHERS
-- =========================================================

INSERT INTO users
(username, password_hash, role, full_name, email)
VALUES
(
    'teacher1',
    '$2b$10$agAcXj3mXKp7JINbNQ7UpO2xmRzUF1jdVNxwigmPKXQCmIYStAmkK',
    'teacher',
    'Kusumlata',
    'kusumlata@regent.ac.uk'
),
(
    'teacher2',
    '$2b$10$agAcXj3mXKp7JINbNQ7UpO2xmRzUF1jdVNxwigmPKXQCmIYStAmkK',
    'teacher',
    'Hany',
    'hany@regent.ac.uk'
),
(
    'teacher3',
    '$2b$10$agAcXj3mXKp7JINbNQ7UpO2xmRzUF1jdVNxwigmPKXQCmIYStAmkK',
    'teacher',
    'Justin',
    'justin@regent.ac.uk'
);


INSERT INTO teachers
(user_id, name, email, subject)
VALUES
(
    2,
    'Kusumlata',
    'kusumlata@regent.ac.uk',
    'Advance Software Development'
),
(
    3,
    'Hany',
    'hany@regent.ac.uk',
    'DevOps'
),
(
    4,
    'Justin',
    'justin@regent.ac.uk',
    'InfoSec'
);


-- =========================================================
-- 3. STUDENTS
-- =========================================================

INSERT INTO users
(username, password_hash, role, full_name, email)
VALUES
(
    'student1',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Dinesh',
    'dinesh@student.regent.ac.uk'
),
(
    'student2',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Satpal',
    'satpal@student.regent.ac.uk'
),
(
    'student3',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Gagandeep',
    'gagandeep@student.regent.ac.uk'
),
(
    'student4',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Jasvir',
    'jasvir@student.regent.ac.uk'
),
(
    'student5',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Mandeep',
    'mandeep@student.regent.ac.uk'
),
(
    'student6',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Asif',
    'asif@student.regent.ac.uk'
),
(
    'student7',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Minimam',
    'minimam@student.regent.ac.uk'
),
(
    'student8',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Tasdik',
    'tasdik@student.regent.ac.uk'
),
(
    'student9',
    '$2b$10$IlRPub2ECVIM3phW/8CGi.oI4lYkgX6is1hrJUYSg58QnmNHL5nTC',
    'student',
    'Arman',
    'arman@student.regent.ac.uk'
);


INSERT INTO students
(user_id, name, email, dob, class)
VALUES
(5,  'Dinesh',     'dinesh@student.regent.ac.uk',     '2003-01-15', 'S2'),
(6,  'Satpal',     'satpal@student.regent.ac.uk',     '2003-02-20', 'S2'),
(7,  'Gagandeep',  'gagandeep@student.regent.ac.uk',  '2003-03-12', 'S2'),
(8,  'Jasvir',     'jasvir@student.regent.ac.uk',     '2002-07-09', 'S2'),
(9,  'Mandeep',    'mandeep@student.regent.ac.uk',    '2003-04-18', 'S2'),
(10, 'Asif',       'asif@student.regent.ac.uk',       '2002-11-02', 'S2'),
(11, 'Minimam',    'minimam@student.regent.ac.uk',    '2003-06-25', 'S2'),
(12, 'Tasdik',     'tasdik@student.regent.ac.uk',     '2003-08-14', 'S2'),
(13, 'Arman',      'arman@student.regent.ac.uk',      '2002-12-05', 'S2');


-- =========================================================
-- 4. SAMPLE ATTENDANCE
-- =========================================================
-- student_id = students table ID
-- marked_by = teachers table ID

INSERT INTO attendance
(student_id, date, status, marked_by)
VALUES
(1, '2026-08-01', 'present', 1),
(1, '2026-08-02', 'present', 2),

(2, '2026-08-01', 'present', 1),
(2, '2026-08-02', 'late',    2),

(3, '2026-08-01', 'present', 2),
(3, '2026-08-02', 'present', 3),

(4, '2026-08-01', 'absent',  1),
(4, '2026-08-02', 'present', 2),

(5, '2026-08-01', 'present', 1),
(5, '2026-08-02', 'present', 3),

(6, '2026-08-01', 'late',    2),
(6, '2026-08-02', 'present', 1),

(7, '2026-08-01', 'present', 3),
(7, '2026-08-02', 'present', 2),

(8, '2026-08-01', 'present', 1),
(8, '2026-08-02', 'absent',  3),

(9, '2026-08-01', 'present', 2),
(9, '2026-08-02', 'present', 1);


-- =========================================================
-- 5. SAMPLE GRADES / COURSE DATA
-- =========================================================

INSERT INTO grades
(student_id, subject, term, grade, marked_by)
VALUES
(1, 'Advance Software Development', 'Term 1', 'A', 1),
(2, 'Advance Software Development', 'Term 1', 'B', 1),
(3, 'InfoSec',                     'Term 1', 'A', 3),
(4, 'InfoSec',                     'Term 1', 'B', 3),
(5, 'DevOps',                      'Term 1', 'A', 2),
(6, 'DevOps',                      'Term 1', 'B', 2),
(7, 'Weekly Seminar S2',           'Term 1', 'A', 1),
(8, 'Weekly Seminar S2',           'Term 1', 'B', 3),
(9, 'Advance Software Development', 'Term 1', 'A', 1);


-- =========================================================
-- END OF SEED DATA
-- =========================================================
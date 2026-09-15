-- =============================================================
-- AI-Powered Employee Event Email Automation System
-- MySQL Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS email_automation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE email_automation;

-- =============================================================
-- Table: admins
-- =============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================================
-- Table: employees
-- =============================================================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================================
-- Table: events
-- =============================================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    event_type ENUM('Annual Day', 'Birthday', 'Meeting', 'Workshop', 'Festival', 'Training', 'Sports Day') NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- =============================================================
-- Table: email_logs
-- =============================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    event_id INT,
    email_subject VARCHAR(255),
    email_body TEXT,
    recipient_email VARCHAR(150),
    sent_time TIMESTAMP NULL,
    status ENUM('Sent', 'Pending', 'Failed') DEFAULT 'Pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- =============================================================
-- Seed Data: Default Admin Account
-- Password: admin123 (bcrypt hashed)
-- =============================================================
INSERT INTO admins (name, email, password, role) VALUES
('HR Admin', 'admin@company.com', '$2a$10$uN.tCgN4xolhGOXjhdIpxuGq5Izu8tq/H1x4eGV2IOgx/TblPgKCW', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- =============================================================
-- Seed Data: Sample Employees
-- =============================================================
INSERT INTO employees (full_name, email, department, designation, status) VALUES
('Antony Joseph', 'antony@company.com', 'Engineering', 'Software Engineer', 'Active'),
('Priya Sharma', 'priya@company.com', 'HR', 'HR Manager', 'Active'),
('Rahul Verma', 'rahul@company.com', 'Marketing', 'Marketing Executive', 'Active'),
('Sneha Patel', 'sneha@company.com', 'Finance', 'Financial Analyst', 'Active'),
('Vikram Singh', 'vikram@company.com', 'Engineering', 'Senior Developer', 'Active'),
('Meera Nair', 'meera@company.com', 'Design', 'UI/UX Designer', 'Inactive'),
('Arjun Kumar', 'arjun@company.com', 'Sales', 'Sales Manager', 'Active'),
('Deepa Menon', 'deepa@company.com', 'Operations', 'Operations Lead', 'Active')
ON DUPLICATE KEY UPDATE email = email;

-- =============================================================
-- Seed Data: Sample Events
-- =============================================================
INSERT INTO events (event_name, event_type, event_date, event_time, venue, description, created_by) VALUES
('Annual Team Celebration', 'Annual Day', '2026-09-30', '17:00:00', 'Company Auditorium', 'Join us for our annual team celebration with awards, music, and dinner.', 1),
('Q3 Strategy Workshop', 'Workshop', '2026-09-25', '10:00:00', 'Conference Hall A', 'Quarterly strategy planning and goal-setting workshop for all departments.', 1),
('Navratri Festival Celebration', 'Festival', '2026-10-02', '18:00:00', 'Company Terrace', 'Come celebrate Navratri with music, dance, and festive food.', 1)
ON DUPLICATE KEY UPDATE event_name = event_name;

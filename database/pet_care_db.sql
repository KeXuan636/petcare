<<<<<<< HEAD
CREATE DATABASE pet_care_db DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
=======
CREATE DATABASE IF NOT EXISTS pet_care_db DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
>>>>>>> a5782b195d246171f98da3e29c8efaea211f2e7e
USE pet_care_db;

CREATE TABLE IF NOT EXISTS users (
    id INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL
);

<<<<<<< HEAD
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
=======
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
>>>>>>> a5782b195d246171f98da3e29c8efaea211f2e7e
);

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
<<<<<<< HEAD
    user_id INT NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    categories VARCHAR(100) NOT NULL,
    vet VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
=======
    pet_name VARCHAR(100) NOT NULL,
    categories VARCHAR(100) NOT NULL,
    vet VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2)
>>>>>>> a5782b195d246171f98da3e29c8efaea211f2e7e
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
<<<<<<< HEAD
    user_id INT NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    clinic VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
=======
    pet_name VARCHAR(100) NOT NULL,
    clinic VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    notes TEXT
>>>>>>> a5782b195d246171f98da3e29c8efaea211f2e7e
);

CREATE TABLE IF NOT EXISTS care_routines (
    id INT AUTO_INCREMENT PRIMARY KEY,
<<<<<<< HEAD
    user_id INT NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    routine_type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample categories
INSERT INTO categories (name) VALUES
('Food & Supplies'),
('Healthcare'),
('Grooming & Hygiene'),
('Boarding & Daycare'),
('Training & Behavior'),
('Licensing & Identification'),
('Miscellaneous / Other');

-- Insert sample users
INSERT INTO users (username, email, password, address, contact, role)
VALUES 
('alice123', 'alice@example.com', SHA1('password123'), '123 Pet Lane', '91234567', 'user'),
('admin01', 'admin@example.com', SHA1('adminpass'), '456 Admin Road', '98765432', 'admin');

-- Insert sample appointments
INSERT INTO appointments (user_id, pet_name, clinic, date, notes)
VALUES
(1, 'Buddy', 'Happy Tails Vet Clinic', '2025-08-05', 'Annual vaccination'),
(1, 'Luna', 'Pawfect Health Clinic', '2025-08-10', 'Dental check-up');

-- Insert sample expenses
INSERT INTO expenses (user_id, pet_name, categories, vet, amount)
VALUES
(1, 'Buddy', 'Healthcare', 'Happy Tails Vet Clinic', 120.50),
(1, 'Luna', 'Food & Supplies', 'N/A', 45.90);

-- Insert sample care routines
INSERT INTO care_routines (user_id, pet_name, routine_type, date, notes)
VALUES
(1, 'Buddy', 'Grooming', '2025-08-01', 'Full bath and nail trim'),
(1, 'Luna', 'Exercise', '2025-08-03', 'Evening park walk');
=======
    pet_name VARCHAR(100) NOT NULL,
    routine_type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    notes TEXT
);
>>>>>>> a5782b195d246171f98da3e29c8efaea211f2e7e

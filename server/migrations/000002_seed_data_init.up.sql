-- Seed users
INSERT INTO users (name, email, role) VALUES
('Admin User', 'admin@example.com', 'admin'),
('Regular User', 'user@example.com', 'user');

-- Seed categories
INSERT INTO categories (name) VALUES
('Pain Relief'),
('Cold and Flu'),
('Allergy'),
('Digestive Health');

-- Seed products
INSERT INTO products (name, category_id, description, price, stock) VALUES
('Aspirin', 1, 'Pain reliever and fever reducer', 5.99, 100),
('Ibuprofen', 1, 'Nonsteroidal anti-inflammatory drug', 7.99, 150),
('Acetaminophen', 1, 'Pain reliever and fever reducer', 6.99, 200),
('Cough Syrup', 2, 'Relieves cough and cold symptoms', 8.99, 50),
('Antihistamine', 3, 'Relieves allergy symptoms', 9.99, 75),
('Antacid', 4, 'Relieves heartburn and indigestion', 4.99, 120);

-- Seed inquiries
INSERT INTO inquiries (message, status, user_id, product_id) VALUES
('Is this product available in larger quantities?', 'pending', 2, 1),
('Can I take this medication with my current prescription?', 'pending', 2, 2);
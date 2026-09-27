CREATE TABLE IF NOT EXISTS watches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL
);

INSERT INTO watches (name, description, price, image_url)
VALUES 
    ('Classic Chronograph', 'Automatic Movement', 299.00, 'chronograph.jpg'),
    ('Luxury Diver', 'Water resistant up to 300m', 899.50, 'diver.jpg'),
    ('Minimalist Dress Watch', 'Ultra-thin profile', 199.99, 'dress.jpg');

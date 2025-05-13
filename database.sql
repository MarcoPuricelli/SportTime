-- Creazione del database
CREATE DATABASE IF NOT EXISTS race_timing;
USE race_timing;

-- Tabella utenti
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella eventi
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella percorsi
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    distance VARCHAR(50) NOT NULL,
    type ENUM('Competitive', 'Non-competitive') NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Tabella categorie
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_age INT,
    max_age INT
);

-- Tabella partecipanti
CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bib_number INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('M', 'F') NOT NULL,
    birth_date DATE NOT NULL,
    nationality VARCHAR(2) NOT NULL,
    fiscal_code VARCHAR(50),
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    team_name VARCHAR(255),
    team_code VARCHAR(50),
    team_type ENUM('FIDAL', 'Runcard', 'None'),
    category_id INT,
    event_id INT NOT NULL,
    route_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Tabella risultati
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    event_id INT NOT NULL,
    route_id INT NOT NULL,
    position INT,
    category_position INT,
    gender_position INT,
    gun_time TIME,
    real_time TIME,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);


-- Inserimento dati:


-- Inserimento dati di esempio per le categorie
-- Inserimento dati di esempio per le categorie
INSERT INTO categories (name, min_age, max_age) VALUES
('Esordienti (EM/EF)', 6, 11),
('Ragazzi (RM/RF)', 12, 13),
('Cadetti (CM/CF)', 14, 15),
('Allievi (AM/AF)', 16, 17),
('Juniores (JM/JF)', 18, 19),
('Promesse (PM/PF)', 20, 22),
('Seniores (SM/SF)', 23, 100),
('SM/SF35', 35, 39),
('SM/SF40', 40, 44),
('SM/SF45', 45, 49),
('SM/SF50', 50, 54),
('SM/SF55', 55, 59),
('SM/SF60', 60, 64),
('SM/SF65', 65, 69),
('SM/SF70', 70, 74),
('SM/SF75', 75, 79),
('SM/SF80', 80, 84),
('SM/SF85', 85, 89),
('SM/SF90', 90, 94),
('SM/SF95', 95, 100);

-- Inserimento dati di esempio per gli eventi
INSERT INTO events (title, description, long_description, date, time, location, image_url) VALUES
('City Marathon 2024', 'Join us for the annual City Marathon with 5km, 10km, and full marathon options.', 'The City Marathon is one of the most anticipated running events of the year. The course is designed to showcase the beauty of our city while providing a challenging yet enjoyable experience for all participants.', '2024-06-10', '07:00:00', 'Central Park, City Center', '/images/events/city-marathon-2024.jpg'),
('Beach Run Festival', 'Run along the beautiful coastline in this scenic beach run with various distance options.', 'Experience the joy of running with sand between your toes and the sound of waves crashing beside you. This event offers a unique running experience for all levels.', '2024-07-15', '08:00:00', 'Sunny Beach', '/images/events/beach-run-2024.jpg'),
('Night Trail Run', 'Experience the thrill of trail running under the stars with our guided night run event.', 'A magical experience awaits as you navigate through forest trails illuminated only by the moon, stars, and your headlamp. Safety marshals will be positioned throughout the course.', '2024-08-05', '20:00:00', 'Forest Park', '/images/events/night-trail-2024.jpg'),
('City Marathon 2023', 'The 2023 edition of our annual City Marathon.', 'The 2023 edition was a huge success with over 1000 participants from around the country. The event featured perfect weather conditions and many personal bests were achieved.', '2023-06-12', '07:00:00', 'Central Park, City Center', '/images/events/city-marathon-2023.jpg');

-- Inserimento dati di esempio per i percorsi
INSERT INTO routes (event_id, name, distance, type) VALUES
(1, '5K Fun Run', '5km', 'Non-competitive'),
(1, '10K Race', '10km', 'Competitive'),
(1, 'Half Marathon', '21.1km', 'Competitive'),
(1, 'Full Marathon', '42.2km', 'Competitive'),
(2, '5K Beach Run', '5km', 'Non-competitive'),
(2, '10K Beach Race', '10km', 'Competitive'),
(3, '10K Night Trail', '10km', 'Competitive'),
(4, '5K Fun Run', '5km', 'Non-competitive'),
(4, '10K Race', '10km', 'Competitive'),
(4, 'Half Marathon', '21.1km', 'Competitive'),
(4, 'Full Marathon', '42.2km', 'Competitive');
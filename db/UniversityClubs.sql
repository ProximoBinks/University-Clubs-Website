CREATE DATABASE UniversityClubs;
USE UniversityClubs;

CREATE TABLE Users (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    date_of_birth DATETIME,
    bio TEXT, -- Added bio column
    isAdmin BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id)
);

CREATE TABLE Clubs (
    id INT AUTO_INCREMENT,
    club_info TEXT,
    image_url TEXT,
    page_url TEXT,
    club_name VARCHAR(63) UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Updates (
    id INT AUTO_INCREMENT,
    post_title VARCHAR(255),
    post_info TEXT,
    post_created DATETIME,
    event_time DATETIME,
    isPrivate BOOLEAN,
    club_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (club_id) REFERENCES Clubs(id) ON DELETE CASCADE
);

CREATE TABLE Club_Enrolments (
    user_id INT,
    club_id INT,
    is_manager BOOLEAN,
    PRIMARY KEY (user_id, club_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES Clubs(id) ON DELETE CASCADE
);

CREATE TABLE Event_RSVPs (
    user_id INT,
    event_id INT NOT NULL,
    is_coming BOOLEAN,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Updates(id) ON DELETE CASCADE
);


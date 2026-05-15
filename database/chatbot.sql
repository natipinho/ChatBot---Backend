DROP DATABASE IF EXISTS chatbot;
CREATE DATABASE IF NOT EXISTS chatbot;
USE chatbot;

CREATE TABLE task (
id INT AUTO_INCREMENT PRIMARY KEY,
title TEXT NOT NULL,
tag TEXT NULL
);

-- ------------------------------------------------------------
--  USERS
-- ------------------------------------------------------------

CREATE TABLE users (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    active      BOOLEAN         NOT NULL DEFAULT TRUE
);

-- Inserts
INSERT INTO users (name, email, active) VALUES
    ('Alice Johnson', 'alice.johnson@email.com', TRUE),
    ('Bob Smith',     'bob.smith@email.com',     FALSE),
    ('Carol White',   'carol.white@email.com',   TRUE),
    ('David Brown',   'david.brown@email.com',   TRUE),
    ('Eva Martinez',  'eva.martinez@email.com',  FALSE);


-- ------------------------------------------------------------
--  TASKS
-- ------------------------------------------------------------
CREATE TABLE tasks (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    done            BOOLEAN         NOT NULL DEFAULT FALSE
);

-- Inserts
INSERT INTO tasks (title, done) VALUES
    ('Design landing page mockup',     TRUE),
    ('Set up project repository',      TRUE),
    ('Write API documentation',        FALSE),
    ('Implement user authentication',  FALSE),
    ('Fix navigation bug on mobile',   TRUE);


-- ------------------------------------------------------------
--  TAGS
-- ------------------------------------------------------------
CREATE TABLE tags (
    id      INT             AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100)    NOT NULL UNIQUE
);


-- Inserts
INSERT INTO tags (name) VALUES
    ('personal'),
    ('health'),
    ('finance'),
    ('family'),
    ('work');


-- ------------------------------------------------------------
--  TASK_TAGS  (associação N:N entre tasks e tags)
-- ------------------------------------------------------------
CREATE TABLE task_tags (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    tag_id  INT NOT NULL,
    UNIQUE KEY uq_task_tag (task_id, tag_id),
    CONSTRAINT fk_tasktag_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasktag_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

-- Inserts
INSERT INTO task_tags (task_id, tag_id) VALUES 
(2, 1),
(5, 3),
(4, 4),
(2, 5),
(3, 2);


CREATE TABLE chat_history (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_message TEXT NOT NULL,
	ai_response TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



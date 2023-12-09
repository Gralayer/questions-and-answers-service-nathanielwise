CREATE TABLE questions (
  question_id INT unsigned AUTO_INCREMENT, /* Make this auto-increment after loading data */
  product_id INT unsigned NOT NULL,
  question_body VARCHAR(255) NOT NULL,
  question_date BIGINT unsigned NOT NULL,
  asker_name VARCHAR(63) NOT NULL,
  asker_email VARCHAR(63) NOT NULL,
  reported BOOLEAN NOT NULL DEFAULT (0),
  question_helpfulness INT unsigned NOT NULL DEFAULT (0),
  PRIMARY KEY (question_id)
);

CREATE TABLE answers (
  answer_id INT unsigned NOT NULL AUTO_INCREMENT, /* Make this auto-increment after loading data */
  question_id INT unsigned NOT NULL,
  body VARCHAR(255) NOT NULL,
  date_written BIGINT unsigned NOT NULL,
  answerer_name VARCHAR(63) NOT NULL,
  answerer_email VARCHAR(63),
  reported BOOLEAN NOT NULL,
  answer_helpfulness INT unsigned NOT NULL,
  PRIMARY KEY (answer_id),
  FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

CREATE TABLE answers_photos (
  photo_id INT unsigned NOT NULL AUTO_INCREMENT, /* Make this auto-increment after loading data */
  answer_id INT unsigned NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (answer_id) REFERENCES answers(answer_id)
);

LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\questions.csv'
INTO TABLE questions
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\answers.csv'
INTO TABLE answers
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA INFILE 'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\answers_photos.csv'
INTO TABLE answers_photos
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

CREATE INDEX idx_question_id ON answers (question_id);
CREATE INDEX idx_answers_id ON answers_photos (answer_id);
CREATE INDEX idx_product_id ON questions (product_id);
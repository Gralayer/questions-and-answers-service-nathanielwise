CREATE TABLE questions (
  id INT unsigned NOT NULL, /* Make this auto-increment after loading data */
  product_id INT unsigned NOT NULL,
  body VARCHAR(255) NOT NULL,
  date_written BIGINT unsigned NOT NULL,
  asker_name VARCHAR(63) NOT NULL,
  asker_email VARCHAR(63) NOT NULL,
  reported BOOLEAN NOT NULL,
  helpful INT unsigned NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE answers (
  id INT unsigned NOT NULL, /* Make this auto-increment after loading data */
  question_id INT unsigned NOT NULL,
  body VARCHAR(255) NOT NULL,
  date_written BIGINT unsigned NOT NULL,
  answerer_name VARCHAR(63) NOT NULL,
  answerer_email VARCHAR(63),
  reported BOOLEAN NOT NULL,
  helpful INT unsigned NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE answers_photos (
  id INT unsigned NOT NULL, /* Make this auto-increment after loading data */
  answer_id INT unsigned NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (answer_id) REFERENCES answers(id)
);

CREATE INDEX idx_question_id ON answers (question_id);
CREATE INDEX idx_answers_id ON answers_photos (answer_id);
CREATE INDEX idx_product_id ON questions (product_id);

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

ALTER TABLE questions AUTO_INCREMENT=3518964;
ALTER TABLE answers AUTO_INCREMENT=6879307;
ALTER TABLE answers_photos AUTO_INCREMENT=2063760;
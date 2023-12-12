const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
})

connection.connect();

app.listen(process.env.PORT);
console.log('Listening on PORT: ' + process.env.PORT);
app.use(cors());
app.use(express.json());

app.get('/qa/questions/:limit', (req, res) => {
  // Loads a limited number of questions.
  const query = (
    `SELECT * FROM questions
    LIMIT ${req.params.limit};`
  );
  connection.query(query, (err, results, fields) => {
    res.status(200).send(results);
  });
});

app.get('/qa/questions/answers/:limit', (req, res) => {
  const query = (
    `SELECT * FROM answers
    LIMIT ${req.params.limit};`
  );
  connection.query(query, (err, results, fields) => {
    res.status(200).send(results);
  });
});

app.get('/qa/questions/answers/photos/:limit', (req, res) => {
  const query = (
    `SELECT * FROM answers_photos
    LIMIT ${req.params.limit};`
  );
  connection.query(query, (err, results, fields) => {
    res.status(200).send(results);
  })
})

app.get('/qa/questions/', (req, res) => {
  // Loads questions for productId, except reported ones.
  const perPage = req.query.count || 5;
  const page = req.query.page || 1;
  const columnsToGrab = `questions.question_id,
    questions.question_body,
    questions.question_date,
    questions.asker_name,
    questions.question_helpfulness,
    questions.reported,
    answers.body,
    answers.date_written,
    answers.answerer_name,
    answers.answer_helpfulness,
    answers_photos.answer_id,
    answers_photos.url`;
  const query = (
    `SELECT ${columnsToGrab} FROM questions
    LEFT JOIN answers ON questions.question_id = answers.question_id
    LEFT JOIN answers_photos ON answers.answer_id = answers_photos.answer_id
    WHERE questions.product_id = ${req.query.product_id}
    AND answers.question_id = questions.question_id
    AND answers_photos.answer_id = answers.answer_id
    AND questions.reported = 0
    AND answers.reported = 0
    LIMIT ${(page - 1) * perPage}, ${perPage};`
  );
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      let result = {
        product_id: req.query.product_id,
        results: []
      };

      for (var i = 0; i < results.length; i++) {
        let isNewQuestion = true;
        result.results.forEach(obj => {
          if (results[i].question_id === obj.question_id) {
            isNewQuestion = false;
          }
        });
        if (isNewQuestion) {
          let answers = {}
          results.forEach(obj => {
            if (obj.question_id === results[i].question_id && !answers[obj.answer_id]) {
              answers[obj.answer_id] = {
                id: obj.answer_id,
                body: obj.body,
                date: new Date(obj.date_written),
                answerer_name: obj.answerer_name,
                helpfulness: obj.answer_helpfulness,
                photos: [],
              }
            }
          });
          results.forEach(obj => {
            if (answers[obj.answer_id]) {
              answers[obj.answer_id].photos.push(obj.url);
            }
          })

          result.results.push({
            question_id: results[i].question_id,
            question_body: results[i].question_body,
            question_date: new Date(results[i].question_date),
            asker_name: results[i].asker_name,
            question_helpfulness: results[i].question_helpfulness,
            reported: false,
            answers: answers,
          });
        };
      }
      res.status(200).send(result);
    }
  });
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  // Returns answers for a given question, except reported ones
  const perPage = req.query.count || 5;
  const page = req.query.page || 1;
  const questionId = req.params.question_id;
  const query = (
    `SELECT * FROM answers
    LEFT JOIN answers_photos ON answers_photos.answer_id = answers.answer_id
    WHERE answers.question_id = ${questionId}
    AND answers_photos.answer_id = answers.answer_id
    AND answers.reported = 0
    LIMIT ${(page - 1) * perPage}, ${perPage};`
  )
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      let response = {
        question: questionId,
        page: page,
        count: perPage,
        results: []
      };
      results.forEach(obj => {
        const answerId = obj.answer_id;
        let answerIsUnique = true;
        for (var i = 0; i < response.results.length; i++) {
          const answer = response.results[i];
          if (answerId === answer.answer_id) {
            answer.photos.push(obj.url);
            answerIsUnique = false;
            i = response.results.length;
          }
        }
        if (answerIsUnique) {
          let answer = {
            answer_id: answerId,
            body: obj.body,
            date: obj.date_written,
            answerer_name: obj.answerer_name,
            helpfulness: obj.helpful,
            photos: [obj.url],
          };
          response.results.push(answer);
        }
      })
      res.status(200).send(response);
    }
  })
});

app.post('/qa/questions', (req, res) => {
  // Adds a question for the given product
  const body = req.body.body || '';
  const name = req.body.name || null;
  const email = req.body.email || null;
  const product = req.body.product_id;
  const columns = 'product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness';
  const values = `${product}, "${body}", ${Date.now()}, "${name}", "${email}", 0, 0`;
  const query = `INSERT INTO questions (${columns}) VALUES (${values})`;
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      res.status(201).send(results);
    }
  });
});

// Answer a question
app.post('/qa/questions/:question_id/answers', (req, res) => {
  // Adds an answer to a given question
  const question = req.params.question_id;
  const body = req.body.body;
  const name = req.body.name;
  const email = req.body.email;
  const photos = req.body.photos;
  const columnsAnswers = 'question_id, body, date_written, answerer_name, answerer_email, reported, answer_helpfulness';
  const columnsPhotos = 'answer_id, url';
  const valuesAnswers = `${question}, "${body}", ${Date.now()}, "${name}", "${email}", 0, 0`
  const queryAnswers = `INSERT INTO answers (${columnsAnswers}) VALUES (${valuesAnswers})`
  connection.query(queryAnswers, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      const answerId = results.insertId;
      try {
        photos.forEach(photoUrl => {
          const valuesPhotos = `${answerId}, '${photoUrl}'`;
          const queryPhotos = `INSERT into answers_photos (${columnsPhotos}) VALUES (${valuesPhotos})`;
          connection.query(queryPhotos, (err, results, fields) => {
            if (err) throw err;
          })
        })
        res.status(201).send()
      } catch {
        res.status(204).send('Failed to insert photos.')
      }
    }
  })
});

// Marks a question as helpful
app.put('/qa/questions/:question_id/helpful', (req, res) => {
  const query = (
    `UPDATE questions
    SET question_helpfulness = question_helpfulness + 1
    WHERE question_id = ${req.params.question_id}`
  );
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      res.status(204).send();
    }
  });
});

// Updates a question to show it was reported
app.put('/qa/questions/:question_id/report', (req, res) => {
  const query = (
    `UPDATE questions
    SET reported = 1
    WHERE question_id = ${req.params.question_id}`
  );
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      res.status(204).send();
    }
  });
});

// Updates an answer to show it was helpful
app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  const query = (
    `UPDATE answers
    SET answer_helpfulness = answer_helpfulness + 1
    WHERE answer_id = ${req.params.answer_id}`
  );
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      res.status(204).send();
    }
  });
});

// Updates an answer to show it has been reported.
app.put('/qa/answers/:answer_id/report', (req, res) => {
  const query = (
    `UPDATE answers
    SET reported = 1
    WHERE answer_id = ${req.params.answer_id}`
  );
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      res.status(204).send();
    }
  });
});

module.exports.app = app;
module.exports.connection = connection;
const express = require('express');
const mysql = require('mysql2');
const app = express();
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
express.json();
let getResults = [];

// To make below better, we need
app.get('/qa/questions/', (req, res) => {
  // Loads questions for productId, except reported ones. Should accept a page and count.
  const perPage = req.query.count || 5;
  const page = req.query.page || 1;
  const columnsToGrab =`questions.question_id,
                        questions.question_body,
                        questions.question_date,
                        questions.asker_name,
                        questions.question_helpfulness,
                        questions.reported,
                        answers.body,
                        answers.date_written,
                        answers.answerer_name,
                        answers.helpful,
                        answers_photos.answer_id,
                        answers_photos.url`;
  const query = (
    `SELECT ${columnsToGrab} FROM questions
      LEFT JOIN answers ON questions.question_id = answers.question_id
      LEFT JOIN answers_photos ON answers.id = answers_photos.answer_id
      WHERE questions.product_id = ${req.query.product_id}
      AND answers.question_id = questions.question_id
      AND answers_photos.answer_id = answers.id
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
                helpfulness: obj.helpful,
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
  const page = req.query.page || 5;
  const questionId = req.params.question_id;
  const query = (
    `SELECT * FROM answers
    LEFT JOIN answers_photos ON answers_photos.answer_id = answers.id
    WHERE answers.question_id = ${questionId}
    AND answers_photos.answer_id = answers.id
    AND answers.reported = 0;
    LIMIT ${(page - 1) * perPage}, ${perPage};`
  )
  connection.query(query, (err, results, fields) => {
    if (err) {
      throw err;
    } else {
      res.status(200).send(results);
    }
  })
})

app.post('/qa/questions', (req, res) => {
  // Adds a question for the given product
  // const body = req.body.body || '';
  // const name = req.body.name || null;
  // const email = req.body.email || null;
  // const product = req.body.product_id;
  /*
    INSERT INTO questions (columns) VALUES (values);
  */
})

// Answer a question
app.post('/qa/questions/:questionId/answers', (req, res) => {
  // Adds an answer to a given question
  // const question = req.params.question_id;
  // const body = req.body.body;
  // const name = req.body.name;
  // const email = req.body.email;
  // const photos = req.body.photos;
  /*
    INSERT INTO answers (columns) VALUES (values);
    INSERT INTO answers_photos (columns) VALUES (values);
  */
  // Doing two inserts is painful. Might want to add the urls as an array somehow in the future.
})

// Marks a question as helpful
app.put('/products/questions/answers/photos/:answerId', (req, res) => {
  /*

  */
})
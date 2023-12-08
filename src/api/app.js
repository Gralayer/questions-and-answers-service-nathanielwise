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
express.json();
let getResults = [];

app.get('/qa/questions/', (req, res) => {
  // Loads questions for productId, except reported ones. Should accept a page and count.
  const perPage = req.body.count || 5;
  const page = req.body.page || 1;
  const query = (
      `SELECT * FROM questions
      LEFT JOIN answers ON questions.id = answers.question_id
      LEFT JOIN answers_photos ON answers.id = answers_photos.answer_id
      WHERE questions.product_id = ${req.body.product_id}
      AND answers.question_id = questions.id
      AND answers_photos.answer_id = answers.id
      AND questions.reported = 0
      AND answers.reported = 0
      LIMIT page * perPage, (page + 1) * perPage;`
    );
  connection.query(query)
    .then(res => getResults = res.data)
    .then(res => res.send(res.data))
    .catch(err => console.log(error));
})

app.get('/qa/questions/:question_id/answers', (req, res) => {
  // Returns answers for a given question, except reported ones
  // const perPage = req.body.count || 5;
  // const page = req.body.page || 5;
  // const questionNum = req.params.question_id;
  /*
    SELECT * FROM answers
    LEFT JOIN answers_photos ON answers_photos.answer_id = answers.id
    WHERE answers.question_id = question
    AND answers_photos.answer_id = answers.id
    AND answers.reported = 0;
    LIMIT page * perPage, (page + 1) * perPage;
  */
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
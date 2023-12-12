const mysql = require('mysql2');
const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:3000/';
const fs = require('fs');
require('dotenv').config();

const concurrency = 20;

let questionsData = [];
let answersData = [];
let photosData = [];

const getAllData = async () => {
  questionsData = (await axios.get('/qa/questions/10000')).data;
  answersData = (await axios.get('/qa/questions/answers/10000')).data;
  photosData = (await axios.get('/qa/questions/answers/photos/10000')).data;
}

let totalInitialLoadTime = 0;
let totalInitialLoadRequests = 0;
const simulateInitialLoad = async () => {
  // Get initial product questions
  const requestTimestamp = Date.now();
  const response = await axios.get(`qa/questions?product_id=1`)
  totalInitialLoadTime += Date.now() - requestTimestamp;
  totalInitialLoadRequests++;
};

let totalQuestionLoadTime = 0;
let totalQuestionLoadRequests = 0;
const simulateQuestionLoad = async (product_id) => {
  // Get initial product questions
  const requestTimestamp = Date.now();
  const response = await axios.get(`qa/questions?product_id=${product_id}`)
  totalQuestionLoadTime += Date.now() - requestTimestamp;
  totalQuestionLoadRequests++;
};

let totalAnswerLoadTime = 0;
let totalAnswerLoadRequests = 0;
const simulateAnswerLoad = async (question_id) => {
  const requestTimestamp = Date.now();
  const response = await axios.get(`qa/questions/${question_id}/answers`)
  totalAnswerLoadTime += Date.now() - requestTimestamp;
  totalAnswerLoadRequests++;
};

let totalAskTime = 0;
let totalAskRequests = 0;
const simulateAskQuestion = async (product_id, body, name, email) => {
  const requestTimestamp = Date.now();
  const response = await axios.post(`qa/questions`, {
    body: body,
    name: name,
    email: email,
    product_id: product_id
  });
  totalAskTime += Date.now() - requestTimestamp;
  totalAskRequests++;
};

let totalAnswerTime = 0;
let totalAnswerRequests = 0;
const simulateAnswerQuestion = async (question_id, body, name, email, photos) => {
  const requestTimestamp = Date.now();
  const response = await axios.post(`qa/questions/${question_id}/answers`, {
    body: body,
    name: name,
    email: email,
    photos: photos
  });
  totalAnswerTime += Date.now() - requestTimestamp;
  totalAnswerRequests++;
};

let totalQuestionHelpfulTime = 0;
let totalQuestionHelpfulRequests = 0;
const simulateHelpfulQuestion = async (question_id) => {
  const requestTimestamp = Date.now();
  const response = await axios.put(`qa/questions/${question_id}/helpful`);
  totalQuestionHelpfulTime += Date.now() - requestTimestamp;
  totalQuestionHelpfulRequests++;
};

let totalQuestionReportTime = 0;
let totalQuestionReportRequests = 0;
const simulateReportQuestion = async (question_id) => {
  const requestTimestamp = Date.now();
  const response = await axios.put(`qa/questions/${question_id}/report`);
  totalQuestionReportTime += Date.now() - requestTimestamp;
  totalQuestionReportRequests++;
};

let totalAnswerHelpfulTime = 0;
let totalAnswerHelpfulRequests = 0;
const simulateHelpfulAnswer = async (answer_id) => {
  const requestTimestamp = Date.now();
  const response = await axios.put(`qa/answers/${answer_id}/helpful`);
  totalAnswerHelpfulTime += Date.now() - requestTimestamp;
  totalAnswerHelpfulRequests++;
};

let totalAnswerReportTime = 0;
let totalAnswerReportRequests = 0;
const simulateReportAnswer = async (answer_id) => {
  const requestTimestamp = Date.now();
  const response = await axios.put(`qa/answers/${answer_id}/report`);
  totalAnswerReportTime += Date.now() - requestTimestamp;
  totalAnswerReportRequests++;
}

const selectRandom = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

const simulateUser = async () => {
  await simulateInitialLoad();
  let product_id = selectRandom(questionsData).product_id;
  await simulateQuestionLoad(product_id);
  let question_id = selectRandom(questionsData).question_id;
  await simulateAnswerLoad(question_id);
  let question_body = selectRandom(questionsData).question_body;
  let asker_name = selectRandom(questionsData).asker_name;
  let asker_email = selectRandom(questionsData).asker_email;
  let photos = [selectRandom(photosData).url, selectRandom(photosData).url, selectRandom(photosData).url];
  let answer_id = selectRandom(answersData).answer_id;
  await simulateAskQuestion(product_id, question_body, asker_name, asker_email);
  await simulateAnswerQuestion(question_id, question_body, asker_name, asker_email, photos);
  await simulateHelpfulQuestion(question_id);
  await simulateHelpfulAnswer(answer_id);
  await simulateReportQuestion(question_id);
  await simulateReportAnswer(answer_id);
}

const stressTest = async () => {
  let finalTimestamp = Date.now()
  let users = [];
  for (var i = 0; i < concurrency; i++) {
    users.push(simulateUser());
  }
  await Promise.all(users);
  finalTimestamp = Date.now() - finalTimestamp;
  console.log(`=======================`);
  console.log(`|       METRICS       |`);
  console.log(`=======================`);
  console.log(`RPS: ${concurrency * 9000 / finalTimestamp}`);
  console.log(`Concurrent Users: ${concurrency}`);
  const timesToReport = {
    'totalInitialLoadTime': totalInitialLoadTime,
    'totalQuestionLoadTime': totalQuestionLoadTime,
    'totalAnswerLoadTime': totalAnswerLoadTime,
    'totalAskTime': totalAskTime,
    'totalAnswerTime': totalAnswerTime,
    'totalQuestionHelpfulTime': totalQuestionHelpfulTime,
    'totalQuestionReportTime': totalQuestionReportTime,
    'totalAnswerHelpfulTime': totalAnswerHelpfulTime,
    'totalAnswerReportTime': totalAnswerReportTime
  };
  const requestsToReport = {
    'totalInitialLoadRequests': totalInitialLoadRequests,
    'totalQuestionLoadRequests': totalQuestionLoadRequests,
    'totalAnswerLoadRequests': totalAnswerLoadRequests,
    'totalAskRequests': totalAskRequests,
    'totalAnswerRequests': totalAnswerRequests,
    'totalQuestionHelpfulRequests': totalQuestionHelpfulRequests,
    'totalQuestionReportRequests': totalQuestionReportRequests,
    'totalAnswerHelpfulRequests': totalAnswerHelpfulRequests,
    'totalAnswerReportRequests': totalAnswerReportRequests
  };
  let reportTimes = Object.entries(timesToReport);
  let reportRequests = Object.entries(requestsToReport);
  for (var i = 0; i < reportTimes.length; i++) {
    console.log(reportTimes[i]);
    console.log(reportRequests[i]);
    console.log(`Average Time per Request: ${(reportTimes[i][1] / reportRequests[i][1]) / 1000}s`);
  }
}

getAllData()
  .then(res => {
    stressTest();
  })
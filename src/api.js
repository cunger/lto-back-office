require('dotenv').config();
const API_KEY = process.env.LTO_BACK_OFFICE_API_KEY;
if (!API_KEY) return;

const uploader = require('./uploader');
const serverless = require('serverless-http');
const express = require('express');
const router = express.Router();

router.get('/ping', (request, response) => {
  return response.send('pong');
});

router.post('/data', (request, response) => {
  if (request.headers['x-auth-token'] !== API_KEY) {
    return response.sendStatus(401);
  }

  try {
    const items = request.body.items;
    if (!items) return response.sendStatus(400);

    uploader.upload(items);
    return response.sendStatus(200);
  } catch (_error) {
    return response.sendStatus(500);
  }
});

const app = express();
app.use(express.json());
app.use('/.netlify/functions/server', router);
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);

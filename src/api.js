require('dotenv').config();
const API_KEY = process.env.LTO_BACK_OFFICE_API_KEY;

const uploader = require('./uploader');
const serverless = require('serverless-http');
const express = require('express');
const app = express();
app.use(express.json());

const router = express.Router();

router.get('/ping', (request, response) => {
  return response.send('pong');
});

router.post('/data', async (request, response) => {
  if (!request.headers['x-auth-token']) return response.sendStatus(401);
  if (request.headers['x-auth-token'] !== API_KEY) return response.sendStatus(401);

  try {
    const items = request.body.items;
    if (!items) return response.sendStatus(400);

    const result = await uploader.upload(items);

    return response.status(200).json(result);
  } catch (_error) {
    return response.sendStatus(500);
  }
});

app.use('/.netlify/functions/api', router);
app.use('/', (request, response) => response.send('Fnord!'));

module.exports = app;
module.exports.handler = serverless(app);

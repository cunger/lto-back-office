require('dotenv').config();
const HEADER_KEY = process.env.BACKOFFICE_HEADER_NAME;
const HEADER_VAL = process.env.BACKOFFICE_HEADER_VALUE;

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
  if (!request.headers[HEADER_KEY]) return response.sendStatus(401);
  if (request.headers[HEADER_KEY] !== HEADER_VAL) return response.sendStatus(401);

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

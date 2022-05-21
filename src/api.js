require('dotenv').config();
const HEADER_KEY = process.env.BACKOFFICE_HEADER_NAME;
const HEADER_VAL = process.env.BACKOFFICE_HEADER_VALUE;

const uploader = require('./uploader');
const serverless = require('serverless-http');
const express = require('express');
const app = express();
app.use(express.json());

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/ping', (request, response) => {
  return response.send('pong');
});

router.post('/photo', upload.single('file'), async (request, response) => {
  console.log('Incoming /photo...');
  if (!request.headers[HEADER_KEY]) return response.sendStatus(401);
  if (request.headers[HEADER_KEY] !== HEADER_VAL) return response.sendStatus(401);
  console.log(request.file);
  console.log(request.file.buffer.length);

  try {
    const link = await uploader.uploadPhoto(request.file);

    return response.status(200).send(link);
  } catch (error) {
    console.log(`[ERROR: /photo] ${error}`);
    return response.sendStatus(500);
  }
});

router.post('/data', async (request, response) => {
  console.log('Incoming /data...');
  if (!request.headers[HEADER_KEY]) return response.sendStatus(401);
  if (request.headers[HEADER_KEY] !== HEADER_VAL) return response.sendStatus(401);

  try {
    const items = request.body.items;
    if (!items) return response.sendStatus(400);

    const result = await uploader.upload(items);

    return response.status(200).json(result);
  } catch (error) {
    console.log(`[ERROR: /data] ${error}`);
    return response.sendStatus(500);
  }
});

app.use('/.netlify/functions/api', router);
app.use('/', (request, response) => response.send('Fnord!'));

module.exports = app;
module.exports.handler = serverless(app);

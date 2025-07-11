require('dotenv').config();
const HEADER_KEY = process.env.BACKOFFICE_HEADER_NAME;
const HEADER_VAL = process.env.BACKOFFICE_HEADER_VALUE;

const uploader = require('./uploader');
const serverless = require('serverless-http');
const express = require('express');
const app = express();
app.use(express.json());

const multer = require('multer');
const middleware = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/ping', (request, response) => {
  return response.send('pong');
});

router.post('/photo', middleware.single('file'), async (request, response) => {
  console.log('Incoming /photo...');

  if (!request.headers[HEADER_KEY]) return response.sendStatus(401);
  if (request.headers[HEADER_KEY] !== HEADER_VAL) return response.sendStatus(401);

  try {
    const url = await uploader.uploadPhoto(request.file);
    console.log("Responding with link: " + url);

    return response.status(200).json({ link: url });
  } catch (error) {
    console.log(`[ERROR: /photo] ${error}`);
    return response.status(500).json({ errors: `${error}` });
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
    console.log(result);

    return response.status(200).json(result);
  } catch (error) {
    console.log(`[ERROR: /data] ${error}`);
    return response.status(500).json({ errors: `${error}` });
  }
});

app.use('/.netlify/functions/api', router);
app.use('/', (request, response) => response.send('Fnord!'));

module.exports = app;
module.exports.handler = serverless(app);

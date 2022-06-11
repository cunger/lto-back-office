require('dotenv').config();
const HEADER_KEY = process.env.BACKOFFICE_HEADER_NAME;
const HEADER_VAL = process.env.BACKOFFICE_HEADER_VALUE;

const uploader = require('./uploader');
const serverless = require('serverless-http');
const express = require('express');
const app = express();
app.use(express.json());

const multer = require('multer');
const middle = multer({ storage: multer.memoryStorage() });
const upload = middle.single('file');

const router = express.Router();

router.get('/ping', (request, response) => {
  return response.send('pong');
});

router.post('/photo', async function (request, response) {
  console.log('Incoming /photo...');
  console.log(request.headers);

  if (!request.headers[HEADER_KEY]) return response.sendStatus(401);
  if (request.headers[HEADER_KEY] !== HEADER_VAL) return response.sendStatus(401);

  upload(request, response, async function (error) {
    if (error instanceof multer.MulterError) {
      console.log(error.name);
      console.log(error.message);
    } else if (error) {
      console.log(`${error}`);
    }

    console.log(request.file);
    try {
      const result = await uploader.uploadPhoto(request.file);
      console.log(result);

      return response.status(200).json(result);
    } catch (error) {
      console.log(`[ERROR: /photo] ${error}`);
      return response.status(500).json({ errors: `${error}` });
    }
  });
})


// router.post('/photo', upload.single('file'), async (request, response) => {

//   if (!request.headers[HEADER_KEY]) return response.sendStatus(401);
//   if (request.headers[HEADER_KEY] !== HEADER_VAL) return response.sendStatus(401);

//   try {
//     const result = await uploader.uploadPhoto(request.file);
//     console.log(result);

//     return response.status(200).json(result);
//   } catch (error) {
//     console.log(`[ERROR: /photo] ${error}`);
//     return response.status(500).json({ errors: `${error}` });
//   }
// });

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

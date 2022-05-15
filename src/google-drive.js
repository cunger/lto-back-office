require('dotenv').config();
const { google } = require('googleapis');
const { PassThrough } = require('stream');

let drive;

async function load() {
  const auth = await new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
  }).getClient();

  drive = google.drive({ version: 'v3', auth });
}

async function uploadPhoto(file, filename, mimetype) {
  if (!drive) await load();

  const stream = new PassThrough();
  stream.end(file.buffer);

  const response = await drive.files.create({
     media: {
       mimeType: mimetype,
       body: stream
     },
     resource: {
       name: filename,
       parents: ['1nSSn0l5vib7t3pQNuC9PHWpzAaaYbvpv']
     },
     fields: 'id'
   });

   return response;
}

module.exports = { uploadPhoto };

require('dotenv').config();
const { google } = require('googleapis');

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

async function uploadPhoto(filename, filedata) {
  if (!drive) await load();

  const response = await drive.files.create({
     media: {
       mimeType: 'image/jpeg',
       body: toStream(filedata)
     },
     resource: {
       name: filename,
       parents: ['1nSSn0l5vib7t3pQNuC9PHWpzAaaYbvpv']
     },
     fields: 'id'
   });

   return response;
}

const Readable = require('stream').Readable;
function toStream(base64) {
  let stream = new Readable();
  stream.push(base64);
  stream.push(null);
  return stream;
}

module.exports = { uploadPhoto };

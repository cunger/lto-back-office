require('dotenv').config();
const { google } = require('googleapis');

let sheets;

async function load() {
  const auth = await new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
  }).getClient();

  sheets = google.sheets({ version: 'v4', auth });
}

async function appendFisheriesData(items) {
  if (!sheets) await load();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: 'Fisheries',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: items.map(item => asFisheriesRow(item))
    }
  });

  return response;
}

async function appendBeachCleanData(items) {
  if (!sheets) await load();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: 'Beach Clean',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: items
        .filter(item => item.type == 'Trash')
        .map(item => asBeachCleanRow(item))
    }
  });

  return response;
}

function asBeachCleanRow(item) {
  item.signature = item.signature || {};

  return [
    item.signature.name || '',
    item.signature.email || '',
    item.signature.token || '',
    item.date,
    item.location,
    item.category,
    item.quantity
  ];
}

function asFisheriesRow(item) {
  item.signature = item.signature || {};

  return [
    item.signature.name || '',
    item.signature.email || '',
    item.signature.token || '',
    item.date,
    item.location,
    item.method,
    item.base,
    item.reason,
    item.quantity,
    item.species,
    item.common_name,
    item.sex,
    item.length,
    item.weight,
    item.fork_length,
    item.tail_length,
    item.head_length,
    item.head_width,
    item.precaudal_length,
    item.carapace_width,
    item.carapace_length,
    item.wingspan,
    item.photos.map(image => image.link).filter(image => image)
  ];
}

module.exports = { appendFisheriesData, appendBeachCleanData };

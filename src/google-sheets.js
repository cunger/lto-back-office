require('dotenv').config();
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
const { google } = require('googleapis');

let sheets;

async function load() {
  const auth = await new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  }).getClient();

  sheets = google.sheets({ version: 'v4', auth });
}

async function appendFisheriesData(items, callback) {
  if (!sheets) await load();

  sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: 'Fisheries',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: items.map(item => asFisheriesRow(item))
    }
  }, callback);
}

async function appendBeachCleanData(items, callback) {
  if (!sheets) await load();

  return sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: 'Beach Clean',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: items
        .filter(item => item.type == 'Trash')
        .map(item => asBeachCleanRow(item))
    }
  }, callback);
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
    ''
  ];
}

module.exports = { appendFisheriesData, appendBeachCleanData };

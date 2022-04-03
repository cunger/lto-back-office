require('dotenv').config();
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
const { google } = require('googleapis');
const sheets = google.sheets('v4');

async function authToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return auth.getClient();
}

async function append(items) {
  try {
    const auth = await authToken();
    const doc = await sheets.spreadsheets.get({
      spreadsheetId,
      auth,
    });

    let range;
    let data;

    for (item of items) {
      if (item.type == 'Catch') {
        range = 'Fisheries';
        data = asFisheriesRow(item);
      }
      if (item.type == 'Trash') {
        range = 'Beach Clean';
        data = asBeachCleanRow(item);
      }

      const res = doc.append({
        range: range,
        valueInputOption: 'RAW', // or: 'USER_ENTERED'
        resource: {
          values: data
        }
      });

      if (res.status == 200) item.synced = true;
    }
  } catch (error) {
    // TODO
    console.log(error);
  }
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

module.exports = { append };

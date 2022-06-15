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
    item.quantity,
    item.additionalNotes
  ];
}

function asFisheriesRow(item) {
  item.signature = item.signature || {};

  if (item.method === 'Other' && item.other_method && item.other_method !== '') {
    item.method = item.other_method;
  }

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
    printDimension(item.length),
    printDimension(item.weight),
    printDimension(item.fork_length),
    printDimension(item.tail_length),
    printDimension(item.head_length),
    printDimension(item.head_width),
    printDimension(item.precaudal_length),
    printDimension(item.carapace_length),
    printDimension(item.carapace_width),
    printDimension(item.wingspan),
    item.photosNote + '\n' + 
    item.photos
      .map(image => image.link)
      .filter(url => !!url)
      .join(', '),
    item.additionalNotes
  ];
}

function printDimension(dimension) {
  // old items
  if (typeof(dimension) === 'string') {
    return dimension;
  }
  // new items
  let str;
  if (dimension.total.length > 0) {
    str = dimension.total;
  } else {
    let rightOrder = true;
    try {
      rightOrder = parseInt(dimension.min) <= parseInt(dimension.max);
    } catch (error) {
    }
    if (rightOrder) {
      str = `${dimension.min} ... ${dimension.max}`;
    } else {
      str = `${dimension.max} ... ${dimension.min}`;
    }
  }
  str = str.trim();
  if (str === '...') {
    str = '';
  }
  return str;
}

module.exports = { appendFisheriesData, appendBeachCleanData };

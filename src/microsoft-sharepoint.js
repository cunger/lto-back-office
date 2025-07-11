require('dotenv').config();

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

let authProvider;
let client;

function load() {
  console.log("Loading client...");

  try {
    authProvider = new TokenCredentialAuthenticationProvider(
      new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      ),
      { 
        scopes: ['https://graph.microsoft.com/.default']
      }
    );

    client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider: authProvider,
    });
  } catch (error) {
    console.log(error);
  }
}

// Excel sheets for the data
const worksheetsUrl = `https://graph.microsoft.com/v1.0/sites/${process.env.SHAREPOINT_SITE_ID}/lists/${process.env.SHAREPOINT_LIST_ID}/items/1/driveitem/workbook/worksheets`;
const beachCleanUrl = `${worksheetsUrl}/BeachClean/tables/Table1/rows/add`;
const fisheriesUrl = `${worksheetsUrl}/Fisheries/tables/Table2/rows/add`;

// OneDrive folder for the photos
const photosUrl = (filename) => `https://graph.microsoft.com/v1.0/drives/${process.env.SHAREPOINT_DRIVE_ID}/root:/Fisheries%20Live%20Files%20photos/AppUploads/${filename}:/content`;

async function uploadPhoto(file) {
  if (client === undefined) load();

  console.log("Uploading photo with an " + (typeof file.buffer) + " buffer length of " + Buffer.byteLength(file.buffer));

  const mimeType = detectMimeType(file.buffer);
  console.log("Detected MIME type: " + mimeType);

  if (mimeType === "image/heic") {
    file.originalname = file.originalname.replace('jpg', 'heic');
  }

  try {
    const response = await client
      .api(photosUrl(file.originalname))
      .header("Content-Type", mimeType)
      .put(new Uint8Array(file.buffer));
    
    console.log("response.webUrl: " + response.webUrl);
    return (response.webUrl || `https://netorg2591883.sharepoint.com/sites/LTOLiveFisheriesFile/Shared%20Documents/Fisheries%20Live%20Files%20photos/AppUploads/${file.originalname}`) + '?csf=1&web=1';
  } catch (error) {
    console.log(error);
  }
}

async function appendFisheriesData(items) {
    if (client === undefined) load();

    if (items.length === 0) {
      console.log('No fisheries data to upload.');
      return Promise.resolve({ values: [] });
    }

    const body = JSON.stringify({
      values: items.map(item => asFisheriesRow(item))
    });
    console.log(`Uploading: ${body}`);

    try {
      return await client.api(fisheriesUrl).post(body);
    } catch (error) {
      console.log(error);
      return Promise.resolve({ values: [], error: error });
    }
}

async function appendBeachCleanData(items) {
    if (client === undefined) load();

    if (items.length === 0) {
      console.log('No beach clean data to upload.');
      return Promise.resolve({ values: [] });
    }

    const body = JSON.stringify({
      values: items.map(item => asBeachCleanRow(item)),
    });
    console.log(`Uploading: ${body}`);

    try {
      return await client.api(beachCleanUrl).post(body);
    } catch (error) {
      console.log(error);
      return Promise.resolve({ values: [], error: error });
    }
}

function asBeachCleanRow(item) {
  // Shift from incoming UTC time to local Mozambique time.
  const utcDate = new Date(item.date);
  const localDate = new Date(utcDate.getTime() + 2 * 60 * 60000);
  // Split date and time, so we can insert them into different columns.
  const datetime = localDate.toISOString().split('T');
  const date = datetime[0];
  const time = datetime[1].split('.')[0].replace('Z','');
  item.signature = item.signature || {};

  return [
    item.signature.name || '',
    item.signature.email || '',
    item.signature.token || '',
    date,
    time,
    item.location || '',
    item.category || '',
    item.quantity || '',
    item.additionalNotes || '',
    `Uploaded from app on ${new Date().toISOString()})`,
  ];
}

function asFisheriesRow(item) {
  // Shift from incoming UTC time to local Mozambique time.
  const utcDate = new Date(item.date);
  const localDate = new Date(utcDate.getTime() + 2 * 60 * 60000);
  // Split date and time, so we can insert them into different columns.
  const datetime = localDate.toISOString().split('T');
  const date = datetime[0];
  const time = datetime[1].split('.')[0].replace('Z','');
  item.signature = item.signature || {};
  item.photos = item.photos || [];

  if (item.method === 'Other' && item.other_method && item.other_method !== '') {
    item.method = item.other_method;
  }

  return [
    item.signature.name || '',
    item.signature.email || '',
    item.signature.token || '',
    date,
    time,
    item.location || '',
    item.method || '',
    item.base || '',
    item.reason || '',
    item.quantity || '',
    item.species || '',
    item.common_name || '',
    item.sex || '',
    printDimension(item.length),
    printDimension(item.fork_length),
    printDimension(item.tail_length),
    printDimension(item.head_length),
    printDimension(item.head_width),
    printDimension(item.precaudal_length),
    printDimension(item.carapace_length),
    printDimension(item.carapace_width),
    printDimension(item.disk_width),
    (
      item.photosNote + '\n' + 
      item.photos
        .map(image => image.link)
        .filter(url => !!url)
        .join('\n')
    ).trim(),
    item.photos
        .map(image => image.filename)
        .filter(name => !!name)
        .join('\n'),
    item.additionalNotes || '',
    `Uploaded from app on ${new Date().toISOString()})`,
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
    if (dimension.avg.length > 0) {
      str = `${str} (avg: ${dimension.avg})`;
    }
  }
  str = str.trim();
  if (str === '...') {
    str = '';
  }
  return str;
}

function detectMimeType(buffer) {
  if (Buffer.isBuffer(buffer)) {
    const jpegSig = buffer.slice(0, 3).toString('hex'); // JPEG = ff d8 ff
    const heicBrand = buffer.slice(8, 12).toString();   // HEIC brand is at offset 8

    if (jpegSig === 'ffd8ff') {
      return 'image/jpeg';
    }

    // HEIC files often contain 'heic', 'heix', 'hevc' as brand identifier
    const heicBrands = ['heic', 'heix', 'hevc', 'mif1', 'msf1'];
    if (heicBrands.includes(heicBrand)) {
      return 'image/heic';
    }
  }

  return 'application/octet-stream';
}

module.exports = { uploadPhoto, appendFisheriesData, appendBeachCleanData };

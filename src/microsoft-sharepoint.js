require('dotenv').config();

const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

let authProvider;
let client;

function load() {
  try {
    console.log("Trying to authenticate...");
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

const worksheetsUrl = `https://graph.microsoft.com/v1.0/sites/${process.env.SHAREPOINT_SITE_ID}/lists/${process.env.SHAREPOINT_LIST_ID}/items/1/driveitem/workbook/worksheets`;
const beachCleanUrl = `${worksheetsUrl}/BeachClean/tables/Table1/rows/add`;
const fisheriesUrl = `${worksheetsUrl}/Fisheries/tables/Table2/rows/add`;
// Create a table by calling:
// await client.api(`${worksheetsUrl}/Fisheries/tables/add`).post({ address: "A1:Y1", hasHeaders: true });

async function appendFisheriesData(items) {
    if (client === undefined) load();

    const body = JSON.stringify({
      values: items.map(item => asFisheriesRow(item))
    });
    console.log(`Uploading: ${body}`);

    try {
      await client.api(fisheriesUrl).post(body);
    } catch (error) {
      console.log(error);
      console.log(`Failed to log fisheries data:\n${body}`);
    }
}

async function appendBeachCleanData(items) {
    if (client === undefined) load();

    const body = JSON.stringify({
      values: items.map(item => asBeachCleanRow(item)),
    });
    console.log(`Uploading: ${body}`);

    try {
      await client.api(beachCleanUrl).post(body);
    } catch (error) {
      console.log(error);
      console.log(`Failed to log beach clean data:\n${body}`);
    }
}

function asBeachCleanRow(item) {
  item.signature = item.signature || {};

  return [
    item.signature.name || '',
    item.signature.email || '',
    item.signature.token || '',
    new Date(parseInt(item.date)).toUTCString(),
    item.location,
    item.category,
    item.quantity,
    item.additionalNotes || '',
    `Uploaded from app on ${new Date().toUTCString()})`, 
  ];
}

function asFisheriesRow(item) {
  item.signature = item.signature || {};
  item.photos = item.photos || [];

  if (item.method === 'Other' && item.other_method && item.other_method !== '') {
    item.method = item.other_method;
  }

  return [
    item.signature.name || '',
    item.signature.email || '',
    item.signature.token || '',
    new Date(parseInt(item.date)).toUTCString(),
    item.location,
    item.method,
    item.base,
    item.reason,
    item.quantity,
    item.species,
    item.common_name,
    item.sex,
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

module.exports = { appendFisheriesData, appendBeachCleanData };

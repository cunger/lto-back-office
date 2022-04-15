const GoogleSheets = require('./google-sheets');
const GoogleDrive = require('./google-drive');

async function uploadPhoto(file) {
  let result = { link: undefined, errors: [] };
  let response;

  try {
    response = await GoogleDrive.uploadPhoto(file);

    if (response.status == 200) {
      result.link
    }
  } catch (error) {
    console.log(`[ERROR: GoogleDrive.uploadPhoto] ${error}`);
    result.errors.push(`${error}`);
  }

  return result;
}

async function upload(items) {
  let result = { uploaded: [], errors: [] };

  const catches = items.filter(item => item.type == 'Catch');
  const trashes = items.filter(item => item.type == 'Trash');

  let response;

  try {
    response = await GoogleSheets.appendFisheriesData(catches);

    if (response.status == 200) {
      for (item of catches) result.uploaded.push(item.id);
    }
  } catch (error) {
    console.log(`[ERROR: GoogleSheets.appendFisheriesData] ${error}`);
    result.errors.push(`${error}`);
  }

  try {
    response = await GoogleSheets.appendBeachCleanData(trashes);

    if (response.status == 200) {
      for (item of trashes) result.uploaded.push(item.id);
    }
  } catch (error) {
    console.log(`[ERROR: GoogleSheets.appendBeachCleanData] ${error}`);
    result.errors.push(`${error}`);
  }

  return result;
}

module.exports = { upload, uploadPhoto };

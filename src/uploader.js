const GoogleSheets = require('./google-sheets');

async function upload(items) {
  let result = { uploaded: [], errors: [] };

  // First, get image data and upload images to Google Drive.
  // Replace images by link.
  // TODO

  // Then append rows to Google Sheet.

  const catches = items.filter(item => item.type == 'Catch');
  const trashes = items.filter(item => item.type == 'Trash');

  let response;

  try {
    response = await GoogleSheets.appendFisheriesData(catches);

    if (response.status == 200) {
      for (item of catches) result.uploaded.push(item.id);
    }
  } catch (error) {
    console.log(error);
    result.errors.push(`${error}`);
  }

  try {
    response = await GoogleSheets.appendBeachCleanData(trashes);

    if (response.status == 200) {
      for (item of trashes) result.uploaded.push(item.id);
    }
  } catch (error) {
    console.log(error);
    result.errors.push(`${error}`);
  }

  return result;
}

async function uploadPicture(image) {

}

module.exports = { upload };

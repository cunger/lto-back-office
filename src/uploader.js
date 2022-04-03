const GoogleSheets = require('./google-sheets');

async function upload(items) {
  let result = { uploaded: [], errors: [] };
  try {
    // First, get image data and upload images to Google Drive.
    // Replace images by link.
    // TODO

    // Then append rows to Google Sheet.

    const callback = (error, response) => {
      if (error) result.errors.push(error);
      if (response.status == 200) {
        items.forEach(item => result.uploaded.push(item.id));
      };
    };

    await GoogleSheets.appendFisheriesData(
      items.filter(item => item.type == 'Catch'),
      callback
    );

    await GoogleSheets.appendBeachCleanData(
      items.filter(item => item.type == 'Trash'),
      callback
    );

    return result;
  } catch (error) {
    result.errors.push(error);
  }

  return result;
}

async function uploadPicture(image) {

}

module.exports = { upload };

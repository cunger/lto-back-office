const GoogleSheets = require('./google-sheets');

async function upload(items) {
  // First, get image data and upload images to Google Drive.
  // Replace images by link.
  // TODO

  // Then append rows to Google Sheet.
  GoogleSheets.append(items);
}

async function uploadPicture(image) {

}

module.exports = { upload };

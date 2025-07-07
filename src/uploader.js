const SharePoint = require('./microsoft-sharepoint');

async function uploadPhoto(file) {
  let result = { link: undefined, errors: [] };

  try {
    const response = await SharePoint.uploadPhoto(file);

    if (response.status === 200) {
      result.link = response.webUrl;
    } else {
      result.errors.push(`${response.status} ${response.statusMessage}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.uploadPhoto] ${error}`);
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
    response = await SharePoint.appendFisheriesData(catches);
    
    if (!response.error) {
      for (let item of catches) {
        result.uploaded.push(item.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: GoogleSheets.appendFisheriesData] ${error}`);
    result.errors.push(`${error}`);
  }

  try {
    response = await SharePoint.appendBeachCleanData(trashes);

    if (!response.error) {
      for (let item of trashes) {
        result.uploaded.push(item.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: GoogleSheets.appendBeachCleanData] ${error}`);
    result.errors.push(`${error}`);
  }

  return result;
}

module.exports = { upload, uploadPhoto };

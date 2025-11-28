const SharePoint = require('./microsoft-sharepoint');

async function uploadPhoto(file) {
  const url = await SharePoint.uploadPhoto(file);
  return url;
}

async function uploadItems(items) {
  let result = { uploaded: [], errors: [] };

  const catches = items.filter(item => item.type == 'Catch');
  const trashes = items.filter(item => item.type == 'Trash');

  let response;

  try {
    response = await SharePoint.appendFisheriesItems(catches);
    
    if (!response.error) {
      for (let item of catches) {
        result.uploaded.push(item.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.appendFisheriesItems] ${error}`);
    result.errors.push(`${error}`);
  }

  try {
    response = await SharePoint.appendBeachCleanItems(trashes);

    if (!response.error) {
      for (let item of trashes) {
        result.uploaded.push(item.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.appendBeachCleanItems] ${error}`);
    result.errors.push(`${error}`);
  }

  return result;
}

async function uploadSessions(sessions) {
  let result = { uploaded: [], errors: [] };

  const fisheries = items.filter(session => session.type == 'Fisheries');
  const beachcleans = items.filter(session => session.type == 'BeachClean');

  let response;

  try {
    response = await SharePoint.appendFisheriesSessions(fisheries);
    
    if (!response.error) {
      for (let session of fisheries) {
        result.uploaded.push(session.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.appendFisheriesSessions] ${error}`);
    result.errors.push(`${error}`);
  }

  try {
    response = await SharePoint.appendBeachCleanSessions(beachcleans);

    if (!response.error) {
      for (let session of beachcleans) {
        result.uploaded.push(session.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.appendBeachCleanSessions] ${error}`);
    result.errors.push(`${error}`);
  }

  return result;
}

// Function for legacy endpoint POST /data.
// Do not touch, to ensure backwards compatibility.
async function uploadData(items) {
  let result = { uploaded: [], errors: [] };

  const catches = items.filter(item => item.type == 'Catch');
  const trashes = items.filter(item => item.type == 'Trash');

  let response;

  try {
    response = await SharePoint.appendFisheriesItems(catches);
    
    if (!response.error) {
      for (let item of catches) {
        result.uploaded.push(item.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.appendFisheriesItems] ${error}`);
    result.errors.push(`${error}`);
  }

  try {
    response = await SharePoint.appendBeachCleanItems(trashes);

    if (!response.error) {
      for (let item of trashes) {
        result.uploaded.push(item.id);
      }
    } else {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR: SharePoint.appendBeachCleanItems] ${error}`);
    result.errors.push(`${error}`);
  }

  return result;
}

module.exports = { uploadPhoto, uploadData, uploadItems, uploadSessions };

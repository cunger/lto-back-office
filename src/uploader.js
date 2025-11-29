const SharePoint = require('./microsoft-sharepoint');

async function uploadPhoto(file) {
  const url = await SharePoint.uploadPhoto(file);
  return url;
}

async function uploadSession(session) {
  let result = { uploaded: [], errors: [] };
  let response;

  try {
    // Append session row in table.
    if (session.type == 'BeachClean') {
      response = await SharePoint.appendBeachCleanSession(session);
    } else if (session.type == 'Fisheries') {
      response = await SharePoint.appendFisheriesSession(session);
    } else {
      result.errors.push(`Unknown session type: ${session.type}`);
      return result;
    }
    
    if (!response.error) {
      result.uploaded.push(session.id);
    } else {
      result.errors.push(`${response.error}`);
    }

    // Append item rows in table.
    if (session.type == 'BeachClean') {
      response = await SharePoint.appendBeachCleanItems(session);
    } else if (session.type == 'Fisheries') {
      response = await SharePoint.appendFisheriesItems(session);
    } else {
      result.errors.push(`Unknown session type: ${session.type}`);
      return result;
    }

    if (response.error) {
      result.errors.push(`${response.error}`);
    }
  } catch (error) {
    console.log(`[ERROR] ${error}`);
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
    response = await SharePoint.appendFisheriesData(catches);
    
    if (!response?.error) {
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
    response = await SharePoint.appendBeachCleanData(trashes);

    if (!response?.error) {
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

module.exports = { uploadPhoto, uploadData, uploadSession };

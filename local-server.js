const app = require('./src/api');
const sharepoint = require('./src/microsoft-sharepoint');
sharepoint.load();

app.listen(3001, () => console.log('🦈 Local API ready on port 3001.'));

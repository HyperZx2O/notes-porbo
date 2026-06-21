// ponytail: duplicates listAll+_crawl from main.js, runs server-side with secret API key
// Works both in GitHub Actions (via env) and locally (set $env:API_KEY / $env:FOLDER_ID)

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.API_KEY;
const FOLDER_ID = process.env.FOLDER_ID;

if (!API_KEY || !FOLDER_ID) {
  console.error('Usage: set API_KEY and FOLDER_ID environment variables');
  process.exit(1);
}

function fetchJSON(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        if (res.statusCode !== 200) reject(new Error('HTTP ' + res.statusCode + ': ' + data.slice(0, 200)));
        else resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

function listUrl(folderId, token) {
  var url = 'https://www.googleapis.com/drive/v3/files?q=\'' + folderId + '\'+in+parents+and+trashed=false'
    + '&fields=files(id,name,mimeType),nextPageToken'
    + '&pageSize=100&orderBy=folder,name&key=' + API_KEY;
  if (token) url += '&pageToken=' + token;
  return url;
}

function listAll(folderId, token) {
  return fetchJSON(listUrl(folderId, token)).then(function(data) {
    var items = data.files || [];
    if (data.nextPageToken) {
      return listAll(folderId, data.nextPageToken).then(function(more) {
        return items.concat(more);
      });
    }
    return items;
  });
}

function crawl(folderId, prefix, depth) {
  depth = depth || 0;
  if (depth > 6) return Promise.resolve([]);
  return listAll(folderId).then(function(items) {
    var results = [], promises = [];
    items.forEach(function(f) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        promises.push(crawl(f.id, (prefix ? prefix + '/' : '') + f.name, depth + 1));
      } else {
        f._path = (prefix ? prefix + '/' : '') + f.name;
        if (depth >= 2) f._hasGroup = true;
        results.push(f);
      }
    });
    return Promise.all(promises).then(function(a) {
      a.forEach(function(r) { results = results.concat(r); });
      return results;
    });
  });
}

crawl(FOLDER_ID, '', 0).then(function(files) {
  var outDir = path.join(__dirname, '..', '..', 'assets', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  var outFile = path.join(outDir, 'drive-files.json');
  fs.writeFileSync(outFile, JSON.stringify(files, null, 2));
  console.log('Written ' + files.length + ' files to ' + outFile);
}).catch(function(err) {
  console.error('Crawl failed:', err.message);
  process.exit(1);
});

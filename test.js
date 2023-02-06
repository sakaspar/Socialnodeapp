const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above
const express = require('express');
const app = express();



ytdl('https://www.youtube.com/watch?v=YykjpeuMNEk&list=RDuuZE_IRwLNI&index=13')
  .pipe(fs.createWriteStream('video.mp4'));


const directoryPath = path.join(__dirname, '.');

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach(function (file) {
    console.log(file);
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

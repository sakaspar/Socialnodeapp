exports.run = async function() {
const express = require("express");
const fs = require("fs");
const path = require('path');
const ytdl = require('ytdl-core');
const sanitize = require('sanitize-filename');
const port = process.env.PORT || 9090;
const app = express();
const linksFile = 'links.txt';
const BATCH_SIZE = 5;
const WAIT_TIME = 30 * 1000; // 30 seconds
app.use(express.static(path.join(__dirname, 'public')));

// Function to ensure a directory exists, create it if not
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

//functions
async function downloadVideos() {
  try {
    const data = await fs.promises.readFile(linksFile, 'utf-8');
    const links = data.split(',');

    const numVideos = links.length;
    const numBatches = Math.ceil(numVideos / BATCH_SIZE);
    console.log(`Downloading ${numVideos} videos in ${numBatches} batches...`);

    for (let i = 0; i < numBatches; i++) {
      console.log(`Batch ${i + 1}/${numBatches}`);
      const batchStart = i * BATCH_SIZE;
      const batchEnd = Math.min((i + 1) * BATCH_SIZE, numVideos);
      const batchLinks = links.slice(batchStart, batchEnd);
      const promises = [];

      for (let j = 0; j < batchLinks.length; j++) {
        const link = batchLinks[j];
        console.log(`Downloading ${link}...`);

        const info = await ytdl.getInfo(link);
        const title = sanitize(info.videoDetails.title);

        const videoPath = `videos/${title}.mp4`;
        const audioPath = `audios/${title}.mp3`;

        // Ensure the 'audios' directory exists
        ensureDirectoryExists(path.dirname(audioPath));

        const videoPromise = ytdl(link, { filter: 'audioandvideo' })
          .pipe(fs.createWriteStream(videoPath));

        const audioPromise = ytdl(link, { filter: 'audioonly' })
          .pipe(fs.createWriteStream(audioPath));

        promises.push(videoPromise, audioPromise);
      }

      await Promise.all(promises);
      console.log(`Batch ${i + 1} finished downloading.`);

      if (i < numBatches - 1) {
        console.log(`Pausing until batch ${i + 1} is done..`);
        let isReady = false;
        while (!isReady) {
          isReady = await checkBatchReady(links.slice(i * BATCH_SIZE, Math.min((i + 1) * BATCH_SIZE, numVideos)));
          await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
        }
      }
    }

    console.log(`All batches finished downloading.`);
  } catch (err) {
    console.error(err);
  }
}

async function checkBatchReady(batchLinks) {
  const promises = batchLinks.map(async (link) => {
    const info = await ytdl.getInfo(link);
    const title = sanitize(info.videoDetails.title);
    const videoPath = `videos/${title}.mp4`;
    const audioPath = `audios/${title}.mp3`;

    const videoExists = await fs.promises.access(videoPath)
      .then(() => true)
      .catch(() => false);

    const audioExists = await fs.promises.access(audioPath)
      .then(() => true)
      .catch(() => false);

    return videoExists && audioExists;
  });

  const results = await Promise.all(promises);
  return results.every(r => r === true);
}




function getDirectoryContents(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}



















//endpoints 
app.get('/', (req, res) => {
  await downloadVideos();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/shows", (req, res) => {
  fs.readdir("./videos", (err, files) => {
    if (err) {
      console.error(`Error reading directory ./videos.`);
      console.error(err);
      res.sendStatus(500);
      return;
    }

    const videoFiles = files.filter(
      (file) => file.endsWith(".mp4"));


        let html = `<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>mhm..</title>
    </head>
    <body> 
        <h1>V</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap:20px;">`;
        for (const videoFile of videoFiles) {
            html += `<div>
                <div>
                    <h2>${videoFile}</h2>
                </div>
                <video
                    style="height: 300px;min-width:100%"
                    muted
                    playsInline
                    loop
                    controls
                    src="/videos/${videoFile}" 
                    >
                </video>
            </div>`;  
        }

        html += `</div>
    </body>
</html>`;
    res.send(html);
  });
});


app.get('/dir', (req, res) => {
  const audioDir = path.join(__dirname, 'audios');
  const videoDir = path.join(__dirname, 'videos');
  const audioPromise = getDirectoryContents(audioDir);
  const videoPromise = getDirectoryContents(videoDir);

  Promise.all([audioPromise, videoPromise])
    .then(([audioFiles, videoFiles]) => {
      const content = `
        <html>
          <head>
            <title>Directory Contents</title>
          </head>
          <body>
            <h1>Audio Files</h1>
            <ul>
              ${audioFiles.map(file => `<li>${file}</li>`).join('')}
            </ul>
            <h1>Video Files</h1>
            <ul>
              ${videoFiles.map(file => `<li>${file}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;
      res.send(content);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.listen(port, () => {
  console.log(`Open your browser and navigate to http://localhost:${port}`);
});

}

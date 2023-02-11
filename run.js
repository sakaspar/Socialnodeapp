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

      batchLinks.forEach((link) => {
        const title = sanitize(ytdl.getURLVideoID(link));
        const videoPath = `videos/${title}.mp4`;
        const audioPath = `audios/${title}.mp3`;

        console.log(`Downloading ${link}...`);
        const videoStream = ytdl(link, { filter: 'videoonly' });
        const videoFile = fs.createWriteStream(videoPath);
        videoStream.pipe(videoFile);
        const videoPromise = new Promise((resolve, reject) => {
          videoFile.on('finish', resolve);
          videoFile.on('error', reject);
        });

        const audioStream = ytdl(link, { filter: 'audioonly' });
        const audioFile = fs.createWriteStream(audioPath);
        audioStream.pipe(audioFile);
        const audioPromise = new Promise((resolve, reject) => {
          audioFile.on('finish', resolve);
          audioFile.on('error', reject);
        });

        promises.push(videoPromise, audioPromise);
      });

      await Promise.all(promises);
      if (i < numBatches - 1) {
        console.log(`Pausing until batch ${i + 1} is finished...`);
        await Promise.all(promises);
      }
    }
  } catch (err) {
    console.error(err);
  }
}


















//endpoints 
app.get('/', (req, res) => {
  ytdl('https://www.youtube.com/watch?v=Ul8vqaGGnY0',{filter: 'audioandvideo'})
  .pipe(fs.createWriteStream('videos/video1.mp4'));


const directoryPath = path.join(__dirname, '.');

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach(function (file) {
    console.log(file);
  });
});
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/new', (req, res) => {
  fs.readFile(linksFile, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    const links = data.split(',');
    links.forEach((link) => {
      
      ytdl(link, { filter: 'audioandvideo' })
        .pipe(fs.createWriteStream(`videos/video-${Date.now()}.mp4`));
      ytdl.getInfo(link,function(err, info) {console.log("info is :",info)})
    });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});




app.get('/new1', async (req, res) => {
 await downloadVideos();
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
        
        <div style="display: flex; flex-wrap: wrap;">`;

        let videoCounter = 0;
        for (const videoFile of videoFiles) {
            html += `<div style="flex: 1; padding: 10px;">
                <div>
                    <h2>${videoFile}</h2>
                </div>
                <video
                    style="height: 300px"
                    muted
                    playsInline
                    loop
                    controls
                    src="/videos/${videoFile}" 
                    >
                </video>
            </div>`;
            
            videoCounter++;
            if (videoCounter % 2 === 0) {
                html += `</div><div style="display: flex; flex-wrap: wrap;">`;
            }
        }

        html += `</div>
    </body>
</html>`;

    for (const videoFile of videoFiles) {
      html += `<div>
                <div>
                    <h2>${videoFile}</h2>
                </div>
                <video
                    style="height: 300px"
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




app.get("/videos/:videoFile", (req, res) => {
  const filePath = `./videos/${req.params.videoFile}`;

  fs.stat(filePath, (err, stat) => {
    if (err) {
      console.error(`File stat error for ${filePath}.`);
      console.error(err);
      res.sendStatus(500);
      return;
    }

    res.setHeader("content-type", "video/mp4");
    res.setHeader("content-length", stat.size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", (error) => {
      console.log(`Error reading file ${filePath}.`);
      console.log(error);
      res.sendStatus(500);
    });
    fileStream.pipe(res);
  });
});


app.get('/dir', (req, res) => {
  let content = '';
  const showContents = (dir) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stat) => {
          if (err) {
            console.error(err);
            return res.sendStatus(500);
          }
          if (stat.isDirectory()) {
            content += `<li>${file}/</li>`;
            showContents(filePath);
          } else {
            content += `<li>${file}</li>`;
          }
        });
      });
    });
  };
  showContents(dir);
  res.send(`
    <html>
      <head>
        <title>Directories and Contents</title>
      </head>
      <body>
        <h1>Directories and Contents</h1>
        <ul>
          ${content}
        </ul>
      </body>
    </html>
  `);
});


app.listen(port, () => {
  console.log(`Open your browser and navigate to http://localhost:${port}`);
});

}

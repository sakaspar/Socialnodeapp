const express = require("express");
const fs = require("fs");
const path = require('path');
const ytdl = require('ytdl-core');
const port = process.env.PORT || 9090;
const app = express();
const linksFile = 'links.txt';
app.use(express.static(path.join(__dirname, 'public')));

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
    });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

/*
app.get('/new', (req, res) => {
  fs.readFile(linksFile, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    const links = data.split(',');
    links.forEach((link) => {
      ytdl.getInfo(link, (err, info) => {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }
        const title = info.title.replace(/\s/g, '-');
        ytdl(link, { filter: 'audioandvideo' })
          .pipe(fs.createWriteStream(`videos/${title}.mp4`));
      });
    });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});
*/
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

app.get("/allshows", (req, res) => {
  fs.readdir("./", (err, files) => {
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
        <title>Videos</title>
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
  showContents(__dirname);
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


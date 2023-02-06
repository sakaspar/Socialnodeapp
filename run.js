const express = require("express");
const fs = require("fs");

const app = express();

const port = 3000;

app.use(express.static("public"));

app.get("/shows", (req, res) => {
  fs.readdir("./videos", (err, files) => {
    if (err) {
      console.error(`Error reading directory ./videos.`);
      console.error(err);
      res.sendStatus(500);
      return;
    }

    const videoFiles = files.filter(
      (file) => file.endsWith(".mp4") || file.endsWith(".webm")
    );

    let html = `<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Video streaming example</title>
    </head>
    <body> 
        <h1>Video streaming example</h1>
        
        <div style="display: flex; flex-direction: row;">`;

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

app.listen(port, () => {
  console.log(`Open your browser and navigate to http://localhost:${port}`);
});

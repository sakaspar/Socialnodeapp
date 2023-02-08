const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

async function extractAudioFromVideo(filePath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath, ".mp4");
    const outputFilePath = path.join("audios", `${fileName}.mp3`);

    // Load the .mp4 file
    ffmpeg(filePath)
      .output(outputFilePath)
      .audioCodec("libmp3lame")
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      })
      .run();
  });
}

(async () => {
  const directoryPath = "videos";

  // Get a list of all .mp4 files in the directory
  const files = fs.readdirSync(directoryPath).filter((file) => {
    return path.extname(file) === ".mp4";
  });
console.log("[[ List of files ]]",files);
  // Extract audio from each .mp4 file
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    try {
      await extractAudioFromVideo(filePath);
    } catch (error) {
      console.error(error);
    }
  }
  
  //Print out dir
const directoryPath = path.join(__dirname, 'directoryName');

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  } 
  files.forEach(function (file) {
    console.log(file);
  });
});

})();

const { FFmpeg } = require("ffmpeg-web");
const fs = require("fs");
const path = require("path");

async function extractAudioFromVideo(filePath) {
  // Load the .mp4 file
  const video = await FFmpeg.load(filePath);

  // Extract the audio
  const audio = await video.extract("audio");

  // Save the audio as an AAC file
  const audioFileName = path.basename(filePath, path.extname(filePath)) + ".aac";
  const audioFilePath = path.join("audios", audioFileName);
  await audio.save(audioFilePath);
}A

(async () => {
  const directoryPath = "videos";

  // Get a list of all .mp4 files in the directory
  const files = fs.readdirSync(directoryPath).filter((file) => {
    return path.extname(file) === ".mp4";
  });

  // Extract audio from each .mp4 file
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    await extractAudioFromVideo(filePath);
  }
})();

const { exec,spawn } = require("child_process");


// Installing FFmpeg
exec("sudo apt-get install ffmpeg -y", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  
    // Changing video resolution
    exec("ffmpeg -i input.mp4 -vf scale=540:-1 output.mp4", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  });

  const addSubtitles = (inputVideo, subtitleFile, outputVideo) => {
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    inputVideo,
    "-i",
    subtitleFile,
    "-c:v",
    "copy",
    "-c:a",
    "copy",
    "-c:s",
    "mov_text",
    outputVideo
  ]);

  ffmpeg.stderr.on("data", data => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on("close", code => {
    console.log(`FFmpeg process exited with code ${code}`);
  });
};

addSubtitles("input.mp4", "subtitles.srt", "output.mp4");

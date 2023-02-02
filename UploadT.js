const fs = require("fs");
const axios = require("axios");

async function uploadVideo(openId, accessToken, video) {
  const url = "https://open-api.tiktok.com/share/video/upload";
  const formData = new FormData();
  formData.append("open_id", openId);
  formData.append("access_token", accessToken);
  formData.append("video", fs.createReadStream(video), {
    contentType: "video/mp4"
  });

  const config = {
    headers: formData.getHeaders()
  };

  try {
    const response = await axios.post(url, formData, config);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

const openId = "YOUR_OPEN_ID";
const accessToken = "YOUR_ACCESS_TOKEN";
const video = "path/to/video.mp4";

uploadVideo(openId, accessToken, video);

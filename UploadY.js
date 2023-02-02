const fs = require("fs");
const { google } = require("googleapis");

async function uploadToYouTube(auth, video) {
  const youtube = google.youtube({ version: "v3", auth });
  const fileSize = fs.statSync(video).size;
  const res = await youtube.videos.insert(
    {
      part: "id,snippet,status",
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: "My Video Title",
          description: "My Video Description"
        },
        status: {
          privacyStatus: "private"
        }
      },
      media: {
        body: fs.createReadStream(video)
      }
    },
    {
      // Use the `onUploadProgress` event from Axios to track the
      // number of bytes uploaded and report progress.
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / fileSize) * 100;
        console.log(`${Math.round(progress)}% complete`);
      }
    }
  );
  console.log(`Video was uploaded! Video ID: ${res.data.id}`);
}

const video = "path/to/video.mp4";

const oAuth2Client = new google.auth.OAuth2(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "YOUR_REDIRECT_URI"
);

oAuth2Client.setCredentials({
  access_token: "YOUR_ACCESS_TOKEN",
  refresh_token: "YOUR_REFRESH_TOKEN"
});

uploadToYouTube(oAuth2Client, video);

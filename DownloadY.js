const axios = require("axios");
const API_KEY = "YOUR_API_KEY";

const searchShortVideos = async (query) => {
  const results = await axios.get(`https://www.googleapis.com/youtube/v3/search?q=${query}&maxResults=10&type=video&part=snippet&videoDefinition=short&key=${API_KEY}`);
  return results.data.items;
};

const getVideoDetails = async (videoIds) => {
  const results = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoIds.join(",")}&part=statistics&key=${API_KEY}`);
  return results.data.items;
};

const installBestShortVideos = async (query) => {
  const shortVideos = await searchShortVideos(query);
  const videoIds = shortVideos.map((video) => video.id.videoId);
  const videoDetails = await getVideoDetails(videoIds);
  const sortedVideos = videoDetails.sort((a, b) => b.statistics.viewCount - a.statistics.viewCount).slice(0, 5);
  console.log("The best 5 short videos based on view count are: ");
  sortedVideos.forEach((video) => console.log(`${video.snippet.title} - Views: ${video.statistics.viewCount}`));
};

// Example usage
installBestShortVideos("funny cat videos").then(console.log);

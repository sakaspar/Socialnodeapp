var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');//Doc : https://developers.google.com/youtube/v3
const axios = require("axios");

var OAuth2 = google.auth.OAuth2;

const API_KEY = "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";


function authorize(credentials, callback) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris;
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}




 

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
  var service = google.youtube('v3');
  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'GoogleDevelopers'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var channels = response.data.items;
    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  });
}


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
installBestShortVideos("funny cat videos").then(console.log)
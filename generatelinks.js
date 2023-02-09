exports.run = function() {
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://youtube.fandom.com/wiki/Most_viewed_YouTube_shorts';

const file = 'links.txt';
request(url, (error, response, html) => {
    if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);
        const links = [];
        $('tbody a').each((i, link) => {
          links.push($(link).attr('href'));
      });
      fs.writeFileSync(file, links.join(',\n'));
      console.log(`Links saved to ${file}`);
      
  }
});
}


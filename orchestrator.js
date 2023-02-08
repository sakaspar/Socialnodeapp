const async = require('async');
const firstScript = require('./generatelinks.js'); 
const secondScript = require('./run.js');
const thirdScript = require('./test.js');
async.series([
  function () {
    firstScript();
  },
  function () {
    secondScript();
  },
  function () {
    thirdScript();
  }
]);

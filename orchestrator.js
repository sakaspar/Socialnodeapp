const async = require('async');
const firstScript = require('./generatelinks.js').run; 
const secondScript = require('./run.js').run;
const thirdScript = require('./test.js').run;

    firstScript();

    secondScript();

    thirdScript();


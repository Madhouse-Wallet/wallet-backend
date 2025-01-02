//globalDeclaration
require("./utils/globals");
const express = require('express');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
let env;
// console.log("global.NODE_ENV ",process.env.NODE_ENV )
console.log("environmentnodeenv",process.env.NODE_ENV)
// if (process.env.NODE_ENV == "development") {
//     console.log("environment","dev")
//     env = require("./config/env.dev.json")
// } else {
//     console.log("environment","prod")
//     env = require("./config/env.prod.json")
// }
global.env = env; 
// console.log("env",env)
require("./config/db")();
const app = express();
const commonRes = require("./utils/response")
// set security HTTP headers
app.use(helmet()); 

//bodyparser for webhook
app.use(bodyParser.json({
    verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/api/v1/user/webhook')) {
         req.rawBody = buf.toString();
      }
    }
  }));
// parse json request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '150mb' }));
// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

// Use Morgan for request logging
app.use(morgan('dev'));

app.use((req, res, next) => {
    res = commonRes(req, res);
    next();
});

// Load your routes

require('./routes')(app);
// console.log("cross-env NODE_ENV=development",global.NODE_ENV,process.env_staging)
module.exports = app;

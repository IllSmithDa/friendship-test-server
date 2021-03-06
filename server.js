const express = require('express');
const cors = require('cors');
const session = require('client-sessions');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const server = express();

const routes = require('./routes/routes');
const requrl = require('./reqURL');

dotenv.config();
const port = 3001;

server.use(bodyParser.json());


const corsOption = {
  origin: requrl.reqURL,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false
};
server.use(cors(corsOption));
/*
server.use((req, res, next) => {
  console.log(req.headers)
  res.setHeader("Access-Control-Allow-Origin", requrl.reqURL );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
*/

// required for uploading images and videos

server.use(session({ 
  secret: process.env.NODE_SESSIONSECRET,
  cookieName: 'session',
  // duration: 30 * 60 * 1000,
  // activeDuration: 5 * 60 * 1000,
}));

//https://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
// add process.env.PORT to avoid this issue
server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

routes(server);
// got credentials working through this help
// https://stackoverflow.com/questions/26284181/aws-missing-credentials-when-i-try-send-something-to-my-s3-bucket-node-js
// https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGOLAB_KEY,)
  // .connect("mongodb://localhost:27017/loanie")
  .then(function() {
    console.log('Database connected successfully to Mongolab');
  })
  .catch(function(err) {
    console.log('DB connection failed..', err.message);
  });

// prevents heroku from setting wbesite to sleep due to inactivity

/*
setInterval(() => {
  request(process.env.BACKEND_URL,(err) => {
    if (err) console.log(err);
    console.log('sucessfully reached website');
  });
}, 900000); // every 5 minutes (300000)
*/
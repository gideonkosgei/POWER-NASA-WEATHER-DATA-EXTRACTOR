
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const helmet = require('helmet');
const compression = require('compression');

// import Routes
const my_routes = require('./app/routes/my_routes');

app.use(compression()); //Compress all routes
app.use(helmet()); // Helmet helps you secure your Express apps by setting various HTTP headers
app.use(cors()); // Enable Cross-origin resource sharing (CORS)
//app.use(bodyParser.json()); // parse requests of content-type - application/json
//app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

// Routes
app.use('/', my_routes);

const PORT = process.env.PORT || 8080; // set port, listen for requests
const IP = '127.0.0.1'
app.listen(PORT,IP, () => {
  console.log(`Server is running on port ${PORT}.`);
});
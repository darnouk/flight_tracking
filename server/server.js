// Name:          server.js
// Description:   Access flight tracking API.  GEOG 576 Lab 6
// Author:        Bucky Badger

const PORT = process.env.PORT || 8080; // Use an environment variable for the port, default to 8080

// Import Required Modules
const express = require("express");
const cors = require("cors");

const app = express(); 

// Serve static files from the "/var/www/html" directory 
app.use(express.static('/var/www/html'));

// Allow us to load environment variables from the .env file
require("dotenv").config();

// *Need version 2.6.* of node-fetch library*
const fetch = require("node-fetch");

const request = require("request");
const { response } = require("express");

// Get the API Key from an Environment Variable called: FLIGHTS_API_KEY
const myFlightsAPIKey = process.env.flightsAPIKey;

console.log("server.js(): myFlightsAPIKey: " + myFlightsAPIKey);

// Distance to find nearby airports
const nearbyAirportDistance = process.env.nearbyAirportDistance;

console.log("nearby airport distance: " + nearbyAirportDistance);

// Base URL of Flight Tracking API
const api_base = "https://airlabs.co/api/v9/";

// Middleware. allowedOrigins - list of URL's that can access the node/express server routes
const allowedOrigins = ['http://34.199.78.131', 'http://18.210.92.23'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Hello Route
app.get('/hello', async (request, response) => {
  console.log("Hello to You! API route has been called");
  response.send({message: "Hello to You"});
});

// Invalid Flights Route
app.get('/flights', async (request, response) => {
  console.error("/flights is an invalid route");
  response.send("/flights is an invalid route");
});

// Flights Based on Airport Code Parameter
app.get('/flights/:airport_code', async (request, response) => {
  const scriptName = "server.js: /flights/:airport_code(): ";
  console.log("in " + scriptName + " ...");
  try {
    // Airport Code Parameter 
    console.log(scriptName + " request.params.airport_code: " + request.params.airport_code);
    var my_airport_code = request.params.airport_code;
    console.log(scriptName + " airport_code: " + my_airport_code);

    // Check if airport_code is being passed in
    console.log(scriptName + "  length of airport code: " + my_airport_code.length);
    if (my_airport_code.length < 1) {
      my_airport_code = process.env.defaultAirportCode;
      alert("Missing airport code.  Default set to: " + my_airport_code);
    }

    // Departing from Airport
    // const api_url = 'https://airlabs.co/api/v9/flights?api_key=' + myFlightsAPIKey + '&dep_iata=' + my_airport_code

    // Arrivals
    const api_url = 'https://airlabs.co/api/v9/flights?api_key=' + myFlightsAPIKey + '&arr_iata=' + my_airport_code;
    console.log("*my airport code: " + api_url);

    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();
    console.log(json);

    // Read the response stream and produce and return a JavaScript object
    response.json(json);

    console.log(" +++++++++ calling runQueries() +++++++++++++++");
    // Used for lab 7
    // runQueries(json);

    console.log(" +++++++++ completed runQueries() +++++++++++++++");
    console.log(`${scriptName} ++++++++++++ done with getFlights airport code: ++++++++++++++` + my_airport_code);
  } catch (error) {
    console.error(scriptName + " Error getting flights for airport: " + error.stack);
    response.status(500).send("Error getting flights for airport");
  }
}); //end flights

// --------------------------------------------------
// Nearby Airports Route with Lat/Long as Parameters
// --------------------------------------------------
app.get('/nearbyAirports/:latitude,:longitude', async (request, response) => {
  try {
    // Airport Code Parameter 
    console.log("**server.js: nearbyairports(/) request.params.latitude Longitude: " + request.params.latitude + request.params.longitude);
    var latitude, longitude;

    // Check if latitude and longitude are populated
    if (isNaN(request.params.latitude)) {
      console.log(" ** setting lat to default value ...");
      // Populate latitude from the default value in .env file
      latitude = process.env.defaultLatitude;
    } else {
      // Populate from route parameters
      latitude = request.params.latitude;
    }

    // Use Default lat/long if No Values are Present
    if (isNaN(request.params.longitude)) {
      console.log(" ** setting lat to default value ...");
      // Populate latitude from the default value in .env file
      longitude = process.env.defaultLongitude;
    } else {
      // Populate from route parameters
      longitude = request.params.longitude;
    }

    console.log("server.js: lat: " + latitude + ' long:' + longitude);
    // Check if latitude, longitude is being passed in
    console.log("server.js  length of lat long: " + latitude.length);

    // URL to Get Nearby Airports
    const api_url = `https://airlabs.co/api/v9/nearby?api_key=${myFlightsAPIKey}&distance=${nearbyAirportDistance}&lat=${latitude}&lng=${longitude}`;
    console.log("*nearby airport URL: " + api_url);

    // Make request to airlabs.com 
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();
    console.log(json);
    response.json(json);

  } catch (error) {
    console.error("Error getting nearby airport: " + error);
    response.status(500).send("Error getting nearby airport");
  }
}); //end nearbyAirports

app.listen(PORT, '0.0.0.0', function(error) {
  if (error) {
    console.error("Error while starting server" + error.stack);
  } else {
    console.log("Node Server is Listening on PORT: " + PORT);
  }
});

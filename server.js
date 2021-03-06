var express = require("express");
var mongoose = require("mongoose");
var moment = require("moment");
var axios = require("axios");
var cheerio = require("cheerio");
require('dotenv').config()


// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3031;

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/cheerioDB";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// if (process.env.MONGODB_URI) {
//   mongoose.connect(process.env.MONGODB_URI);
// } else {
//   mongoose.connect(databaseUri);
// }

var mongooseConnected = mongoose.connection;

mongooseConnected.on("error", function(err) {
  console.log("Mongoose Error: ", err)
});

mongooseConnected.once("open", function(err) {
  console.log("mongoose Connection Successful");
})

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.worldpoliticsreview.com/daily").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h4")
        .children("a")
        .text();

      result.link = $(this)
        .find("h4")
        .children("a")
        .attr("href");

      result.img = $(this)
        .find(".img")
        .css("background-image")
        .replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');

      result.author = $(this)
        .find(".description")
        .children("a")
        .text();

      let dateString = $(this)
        .find(".description")
        .children(".date")
        .text();

      result.date = moment(dateString.replace("'","")).format("MMM Do YYYY");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("<a href='index.html'>Scrape Complete</a>");
  });
});

// Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "! visit http://localhost:" + PORT);
});

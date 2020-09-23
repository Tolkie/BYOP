/** External modules **/
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var cors = require("cors");

/** Internal modules **/
var taskRouter = require("./server/router/TaskRouter");

/** Mongoose configuration */
var db_url =
  "mongodb://" +
  process.env.MONGODB_USERNAME +
  ":" +
  process.env.MONGODB_PASSWORD +
  "@" +
  process.env.MONGODB_SERVER +
  ":" +
  process.env.MONGODB_PORT +
  "/" +
  process.env.MONGODB_NAME;

var db_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

console.log(db_url);
console.log(db_options);

mongoose
  .connect(db_url, db_options)
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

/**  Express setup**/
var app = express();

/**  Middlewares **/
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/** CORS policy */
app.use(cors());

/**  Express routing**/
app.use("/byop", taskRouter);

/**  404 not found**/
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  error.message = `Could not find route ${req.method} ${req.originalUrl} on this server`;

  next(error);
});

/** Error Management*/
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: error.status,
    message: "Server error occured",
    error: {
      message: error.message,
    },
  });

  next();
});

/** Server deployment**/
console.log("\n--- Information ---");
console.log(" Hostname: ", process.env.MONGODB_SERVER);
console.log(" Port: ", process.env.MONGODB_PORT);
console.log(" Database: ", db_url);

app.listen(process.env.PORT);

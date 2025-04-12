const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

connectDB();

const rooms = require("./routes/rooms");
const reservations = require("./routes/reservations");
const ratings = require("./routes/ratings");
const auth = require("./routes/auth");

const app = express();
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 10,
});
app.use(limiter);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:5003/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(
  cors({
    origin: "http://localhost:5173",

    credentials: true,
  }),
);
app.use("/api/v1/rooms", rooms);
app.use("/api/v1/reservations", reservations);
app.use("/api/v1/auth", auth);
app.use("/api/v1/ratings", ratings);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT,
  ),
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

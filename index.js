const express = require("express");
const connectDatabase = require("./database/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const https = require("https");
const session = require("express-session");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const workerRouter = require("./routes/workers");
const reviewRouter = require("./routes/review");
const bookingRouter = require("./routes/booking");
const adminRouter = require("./routes/admin");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: "https://localhost:5173", // Allow requests from this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

//session middleware
app.use(
  session({
    secret: "your_secret_key", 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true, 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/workers", workerRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/admin", adminRouter);

connectDatabase();

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const options = {
  key: fs.readFileSync(path.resolve(__dirname, "server.key")),
  cert: fs.readFileSync(path.resolve(__dirname, "server.crt")),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

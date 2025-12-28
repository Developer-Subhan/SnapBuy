const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const helmet = require("helmet");
const User = require("./models/User");
const LocalStrategy = require("passport-local");
const {MongoStore} = require("connect-mongo");

const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const orderController = require("./controllers/order");
const authRoutes = require("./routes/auth");

require('dotenv').config();

const app = express();

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  const dbUrl = process.env.DB_URL; 
  if (!dbUrl) return;
  try {
    const conn = await mongoose.connect(dbUrl, {
      bufferCommands: false,
    });
    cachedConnection = conn;
    return conn;
  } catch (err) {
    process.exit(1);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

const fourteenDaysInSeconds = 14 * 24 * 60 * 60;

const store = MongoStore.create({
  mongoUrl: process.env.DB_URL,
  crypto: {
    secret: process.env.SESSION_SECRET || "fallbacksecret",
  },
  touchAfter: 24 * 3600,
  ttl: fourteenDaysInSeconds
});

store.on("error", (e) => {
  console.log("Error in mongo store", e);
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://snapbuy-7662.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.set("trust proxy", 1); 

const sessionOption = {
  store,
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: fourteenDaysInSeconds * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  }
};

app.use(session(sessionOption));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/", authRoutes);

app.get('/api/order-status/:id', orderController.getOrderStatus);

app.use((req, res, next) => {
  const err = new Error("Route not found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';
    res.status(statusCode).json({ message, error: err.name });
});

module.exports = app;
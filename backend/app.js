require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require("passport");
const path = require("path")
const ejsMate = require("ejs-mate");
const session = require('express-session');
const app = express();
const flash = require("connect-flash")
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user")
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/sahyog/auth', require('./routes/auth.routes'));
app.use('/sahyog/labour', require('./routes/labour.routes'));
app.use("/sahyog/bookings",require("./routes/booking.routes"));
app.use("/sahyog/reviews",require("./routes/review.routes"));
app.get("/",(req,res)=>{
    res.json({message: "API running"});
})
app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
const express = require("express");
const bodyParser = require("body-parser");
const { port } = require("./src/config/appConfig");
const userRoutes = require("./src/routes/userRoutes");
const miscellaneousRoutes = require("./src/routes/miscellaneousRoutes");
const characterRoutes = require("./src/routes/characterRoutes");
const huntsRoutes = require("./src/routes/huntSessionRoutes");
const clientOptionsRoutes = require("./src/routes/clientOptionsRoutes");
const cors = require("cors");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("./src/models/User");
const session = require("express-session");
const { connectToDatabase } = require("./src/database/mongo");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function (req, username, password, done) {
      await connectToDatabase();
      const user = await User.findOne({ email: username });
      debugger;
      if (!user) {
        done(true, false, { message: "Incorrect email" });
      }

      const match = await user.matchPassword(password);
      if (match) {
        done(null, user);
      } else {
        done(true, false, {
          message: "Incorrect password",
        });
      }
    }
  )
);
passport.use(
  "signin",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function (req, username, password, done) {
      await connectToDatabase();
      const existingUser = await User.findOne({ email: username });
      if (existingUser) {
        done(true, false, { message: "Email already exist" });
      }
      const newUser = new User({
        email: username,
        name: username,
        password: "",
      });
      newUser.password = await newUser.encryptPassword(password);
      debugger;
      await newUser
        .save()
        .then(() => console.log("Usuario guardado"))
        .catch(console.error);
      done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// User endpoints
app.use(userRoutes);

// Miscellaneous endpints
app.use(miscellaneousRoutes);

// Endpoints for characters
app.use(characterRoutes);

/** Endpoints for character hunts */
app.use(huntsRoutes);

// Endpoints for client options
app.use(clientOptionsRoutes);

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;

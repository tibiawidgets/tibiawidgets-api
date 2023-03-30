const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const { connectToDatabase } = require("../database/mongo");

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
      if (!user) {
        const error = new Error("Email doesn't exist");
        error.status = 404;
        return done(error, null, null, error.status);
      }

      const match = await user.matchPassword(password);
      if (match) {
        return done(null, user);
      } else {
        const error = new Error("Incorrect password");
        error.status = 401;
        return done(error, null, null, error.status);
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
    async (req, email, password, done) => {
      const { username } = req.body;
      if (!username) {
        const error = new Error("Missing username");
        error.status = 401;
        return done(error, null, null, error.status);
      }
      if (!email) {
        const error = new Error("Missing email");
        error.status = 401;
        return done(error, null, null, error.status);
      }
      if (!password) {
        const error = new Error("Missing password");
        error.status = 401;
        return done(error, null, null, error.status);
      }
      await connectToDatabase();
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const error = new Error("Email already exist");
        error.status = 401;
        return done(error, null, null, error.status);
      }
      const newUser = new User({
        email,
        username,
        password,
      });
      newUser.password = await newUser.encryptPassword(password);
      try {
        await newUser.save().catch(console.error);
        return done(null, newUser);
      } catch (e) {
        const error = new Error(e);
        error.status = 500;
        return done(error, null, null, error.status);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

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

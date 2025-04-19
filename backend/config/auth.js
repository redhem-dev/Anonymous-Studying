const passport = require('passport');
require("dotenv").config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;

//import User model
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback: true
  },
  async (request, accessToken, refreshToken, profile, done) => {
   try{
    const email = profile.emails[0].value;
    const username = profile.displayName;
    const emailHash = User.hashEmail(email);
    
    let user = await User.findByEmailHash(emailHash);
    
    if (user) {
      // User exists, update last login
      await User.updateLastLogin(user.id);

    } else {
      // User does not exist, create new user
      const newUserId = await User.create(emailHash, username);
      user = { id: newUserId, username };
    }

    return done(null, user);

  } catch (error) {
    console.error('Error finding or creating user:', error);
    return done(error, null);
  }
}
));

//Store user ID in session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});


//This is called on every request (after the user is logged in) 
//to load the full user object from the database using 
//the ID stored in the session.

//This gives the app access to the user details (req.user) on protected routes like /protected.
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err);
      }
  });

module.exports = passport;
const passport = require('passport');
require("dotenv").config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;

//import User model
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/google/callback",
    passReqToCallback: true,
    proxy: true // Trust reverse proxy - critical for proper redirect URL handling
  },
  async (request, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const emailHash = User.hashEmail(email);
      
      // Check if user exists
      const existingUser = await User.findByEmailHash(emailHash);
      
      if (existingUser) {
        // User exists, update last login and return user
        await User.updateLastLogin(existingUser.id);
        return done(null, existingUser);
      } else {
        // User doesn't exist yet
        // Return temporary user object with email for registration flow
        // Don't store in DB yet - will be created after username is set
        return done(null, {
          tempUser: true,
          email: email,
          emailHash: emailHash,
          // No username or id yet - will be set in registration
        });
      }
    } catch (error) {
      console.error('Error in Google authentication:', error);
      return done(error, null);
    }
}
));

//Store user data in session
passport.serializeUser(function(user, done) {
  if (user.tempUser) {
    // For temporary users (during registration flow), store the whole temp object
    done(null, { tempUser: true, email: user.email, emailHash: user.emailHash });
  } else {
    // For regular users, just store the ID
    done(null, { id: user.id });
  }
});


//This is called on every request (after the user is logged in) 
//to load the full user object from the database using 
//the ID stored in the session.

//This gives the app access to the user details (req.user) on protected routes like /protected.
passport.deserializeUser(async (serializedUser, done) => {
    try {
        // Check what type of data we have serialized
        if (typeof serializedUser === 'object' && serializedUser !== null) {
            // Handle the new serialization format
            if (serializedUser.tempUser) {
                // For temporary users, just pass back the temp user object
                // This is for the registration flow
                return done(null, {
                    tempUser: true,
                    email: serializedUser.email,
                    emailHash: serializedUser.emailHash
                });
            } else if (serializedUser.id) {
                // For regular users, load from database
                const user = await User.findById(serializedUser.id);
                if (!user) {
                    console.warn(`deserializeUser: No user found for id ${serializedUser.id}`);
                    return done(null, false);
                }
                return done(null, user);
            }
        } else {
            // Legacy format (just ID)
            const userId = serializedUser;
            const user = await User.findById(userId);
            if (!user) {
                console.warn(`deserializeUser: No user found for id ${userId}`);
                return done(null, false);
            }
            return done(null, user);
        }
        
        // If we get here, the serialized data is invalid
        console.warn('deserializeUser: Invalid serialized user data');
        return done(null, false);
    } catch (err) {
        console.error('Error in deserializeUser:', err);
        done(err);
    }
});

module.exports = passport;
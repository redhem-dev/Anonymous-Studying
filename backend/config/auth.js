const passport = require('passport');
require("dotenv").config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;

//import functions
const { 
    hashEmail, 
    findUserByEmailHash, 
    createUser, 
    updateLastLogin, 
    getUserById 
} = require('./config/database');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback: true
  },
  async (accessToken, refreshToken, profile, done) => {
   try{
    const email = profile.emails[0].values;
    const username = profile.displayName;
    const emailHash = hashEmail(email);
    
    let user = await findUserByEmailHash(emailHash);
    
    if (user) {
      // User exists, update last login

      await updateLastLogin(user.id);

    } else {
      // User does not exist, create new user

      const newUserId = await createUser(emailHash, username);
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
        const user = await getUserById(id);
        done(null, user);
      } catch (err) {
        done(err);
      }
  });


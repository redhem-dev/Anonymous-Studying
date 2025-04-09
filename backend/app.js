const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/auth');

function isLoggedIn(req, res, next) {
    req.user ? next(): res.sendStatus(401);
}

const app = express();
app.use(express.json());

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>');
})

app.get('/auth/google', 
    passport.authenticate('google', {scope: ['email', 'profile']})
);

app.get('/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/protected',
        failureRedirect: '/'
    })
);



app.get('/protected', isLoggedIn, (req, res) => {
    const googleId = req.user.id;
    
    // Send back user information 
    res.json({
        message: "You're authenticated!",
        user: req.user,
        googleId: googleId
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
})
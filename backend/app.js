const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/auth');

const { 
    getTickets, 
    getTicketById,
    changeUsername
 } = require('./config/database');

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

//LOG OUT
app.get('/logout', (req, res) => {
    req.logout(err => {
      if (err) {
        return res.status(500).send('Logout failed.');
      }
      req.session.destroy(() => {
        res.redirect('/');
      });
    });
});

//------------------ USER ------------------
// Get user by ID (only if logged in)
app.get('/user/:id', isLoggedIn, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await getUserByID(userId);
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
});

// Change username
app.post('/user/change-username', isLoggedIn, async (req, res) => {
    const userId = req.user.id;
    const { newUsername } = req.body;
  
    //CHECK LOGIC WITH @Edhem
    if (!newUsername || newUsername.length < 3) {
      return res.status(400).json({ message: 'Invalid username' });
    }
  
    await changeUsername(userId, newUsername);
    res.json({ message: 'Username updated successfully' });
});


//------------------ TICKETS ------------------

app.get('/tickets', async (req, res) => {
    const tickets = await getTickets();
    res.send(tickets);
});

app.get('/tickets/:id', async (req, res) => {
    const id = req.params.id;
    const ticket = await getTicketById(id);
    res.send(ticket);
});



//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


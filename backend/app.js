const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/auth');

const { 
    getTickets, 
    getTicketById,
    createTicket,
    editTicket,
    deleteTicket,
    changeUsername,
    increaseUpvoteOnTicket,
    decreaseUpvoteOnTicket,
    increaseDownvoteOnTicket,
    decreaseDownvoteOnTicket,
    getReplyByID,
    createReply,
    editReply,
    deleteReply,
    increaseUpvoteOnReply,
    decreaseUpvoteOnReply,
    increaseDownvoteOnReply,
    decreaseDownvoteOnReply,
    addTicketToFavourite,
    removeTicketFromFavourite,
    getAllUsersFavoriteTicketsByID,
    getAllUsersTicketsByID
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

//GET ALL TICKETS
app.get('/tickets', async (req, res) => {
    const tickets = await getTickets();
    res.send(tickets);
});

//GET TICKET BY ID
app.get('/tickets/:id', async (req, res) => {
    const id = req.params.id;
    const ticket = await getTicketById(id);
    res.send(ticket);
});

//TICKETS BY USER ID
app.get('/user/:id/tickets', isLoggedIn, async (req, res) => {
    try {
        const tickets = await getAllUsersTicketsByID(req.params.id);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ error: 'Could not retrieve your tickets' });
    }
});


//CREATE
app.post('/ticket', isLoggedIn, async (req, res) => {
    const { title, body, topicId } = req.body;
    const authorId = req.user.id;
  
    try {
        const ticketId = await createTicket(title, body, topicId, authorId);
        res.status(201).json({ message: 'Ticket created!', ticketId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

//EDIT TICKET
//CHECK WITH @Edhem image uploads
//Add multer for Image Upload (npm install multer and set up storage)
app.put('/ticket/:id', isLoggedIn, async (req, res) => {
    const ticketId = req.params.id;
    const { title, body } = req.body;
    const newImageBuffer = req.file ? req.file.buffer : null; // If you're handling file uploads
  
    try {
      await editTicket(ticketId, title, body, newImageBuffer);
      res.json({ message: 'Ticket updated successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
});

//DELETE TICKET
app.delete('/ticket/:id', isLoggedIn, async (req, res) => {
    const ticketId = req.params.id;
  
    try {
        await deleteTicket(ticketId);
        res.json({ message: 'Ticket deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

//UPVOTE
app.post('/ticket/:id/upvote', isLoggedIn, async (req, res) => {
    await increaseUpvoteOnTicket(req.params.id);
    res.json({ message: 'Upvoted!' });
});

//DOWNVOTE
app.post('/ticket/:id/downvote', isLoggedIn, async (req, res) => {
    await increaseDownvoteOnTicket(req.params.id);
    res.json({ message: 'Downvoted!' });
});

//DECREASE UPVOTE
app.post('/ticket/:id/unupvote', isLoggedIn, async (req, res) => {
    await decreaseUpvoteOnTicket(req.params.id);
    res.json({ message: 'Upvote removed!' });
});

//DECREASE DOWNVOTE
app.post('/ticket/:id/undownvote', isLoggedIn, async (req, res) => {
    await decreaseDownvoteOnTicket(req.params.id);
    res.json({ message: 'Downvote removed!' });
});

//FAVORITES
app.get('/user/:id/favorites', isLoggedIn, async (req, res) => {
    try {
        const favorites = await getAllUsersFavoriteTicketsByID(req.params.id);
        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Could not retrieve favorite tickets' });
    }
});

app.post('/ticket/:ticketId/favourite', isLoggedIn, async (req, res) => {
    const ticketId = parseInt(req.params.ticketId, 10);
    try {
        await addTicketToFavourite(req.user.id, ticketId);
        res.status(201).json({ message: 'Ticket added to favorites' });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Could not add ticket to favorites' });
    }
});

//CHECK WITH @Edhem if we need to remove from favorites in ticket or just from favorites table
app.delete('/ticket/:ticketId/favourite', isLoggedIn, async (req, res) => {
    const ticketId = parseInt(req.params.ticketId, 10);
    try {
        await removeTicketFromFavourite(req.user.id, ticketId);
        res.status(200).json({ message: 'Ticket removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Could not remove ticket from favorites' });
    }
});

app.delete('/user/:userId/favorites/:ticketId', isLoggedIn, async (req, res) => {
    const ticketId = parseInt(req.params.ticketId, 10);
    try {
        await removeTicketFromFavourite(req.params.userId, ticketId);
        res.status(200).json({ message: 'Ticket removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Could not remove ticket from favorites' });
    }
});



//------------------ REPLIES ------------------
app.post('/tickets/:ticketId/replies', isLoggedIn, async (req, res) => {
    const { body, image } = req.body;
    const ticketId = req.params.ticketId;
    const authorId = req.user.id;

    try {
        const replyId = await createReply(ticketId, authorId, body, image || null);
        res.status(201).json({ message: 'Reply posted', replyId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to post reply' });
    }
});

//ALL REPLIES
app.get('/tickets/:ticketId/replies', isLoggedIn, async (req, res) => {
    try {
        const replies = await getAllReplies(req.params.ticketId);
        res.json(replies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch replies' });
    }
});

// Get a reply by ID
app.get('/tickets/:ticketId/replies/:replyId', isLoggedIn, async (req, res) => {
    try {
        const reply = await getReplyByID(req.params.replyId);
        if (!reply) return res.status(404).json({ error: 'Reply not found' });
        res.json(reply);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reply' });
    }
});

//DELETE REPLY
app.delete('/tickets/:ticketId/replies/:replyId', isLoggedIn, async (req, res) => {
    try {
        await deleteReply(req.params.replyId);
        res.json({ message: 'Reply deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete reply' });
    }
});

//EDIT REPLY
app.put('/tickets/:ticketId/replies/:replyId', isLoggedIn, async (req, res) => {
    const { body, image } = req.body;
    const replyId = req.params.replyId;
  
    try {
        await editReply(replyId, body, image || null);
        res.json({ message: 'Reply updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update reply' });
    }
});

//UPVOTE
app.post('/tickets/:ticketId/replies/:replyId/upvote', isLoggedIn, async (req, res) => {
    try {
        await increaseUpvoteOnReply(req.params.replyId);
        res.json({ message: 'Upvote added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upvote reply' });
    }
});

app.post('/tickets/:ticketId/replies/:replyId/downvote', isLoggedIn, async (req, res) => {
    try {
        await increaseDownvoteOnReply(req.params.replyId);
        res.json({ message: 'Downvote added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to downvote reply' });
    }
});

//DOWNVOTE
app.post('/tickets/:ticketId/replies/:replyId/upvote/decrease', isLoggedIn, async (req, res) => {
    try {
        await decreaseUpvoteOnReply(req.params.replyId);
        res.json({ message: 'Upvote removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to decrease upvote' });
    }
});

app.post('/tickets/:ticketId/replies/:replyId/downvote/decrease', isLoggedIn, async (req, res) => {
    try {
        await decreaseDownvoteOnReply(req.params.replyId);
        res.json({ message: 'Downvote removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to decrease downvote' });
    }
});


//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


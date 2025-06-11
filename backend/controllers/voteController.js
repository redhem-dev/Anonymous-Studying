const Vote = require('../models/Vote');

const voteController = {
    // Get user's votes for tickets
    getUserTicketVotes: async (req, res) => {
        try {
            const userId = req.user.id; // Get the user ID from the authenticated user
            const voteMap = await Vote.getUserVotesForTickets(userId);
            
            res.json(voteMap);
        } catch (error) {
            console.error('Error fetching user votes:', error);
            res.status(500).json({ error: 'Failed to fetch votes' });
        }
    },
    
    // Vote on a ticket (upvote or downvote)
    voteOnTicket: async (req, res) => {
        try {
            const userId = req.user.id;
            const ticketId = req.params.ticketId;
            const { voteType } = req.body;
            
            if (!voteType || (voteType !== 'upvote' && voteType !== 'downvote')) {
                return res.status(400).json({ error: 'Invalid vote type. Must be upvote or downvote.' });
            }
            
            const result = await Vote.addTicketVote(userId, ticketId, voteType);
            res.json(result);
        } catch (error) {
            console.error('Error voting on ticket:', error);
            res.status(500).json({ error: 'Failed to register vote' });
        }
    },
    
    // Remove a vote from a ticket
    removeTicketVote: async (req, res) => {
        try {
            const userId = req.user.id;
            const ticketId = req.params.ticketId;
            
            const result = await Vote.removeTicketVote(userId, ticketId);
            res.json(result);
        } catch (error) {
            console.error('Error removing vote:', error);
            res.status(500).json({ error: 'Failed to remove vote' });
        }
    }
};

module.exports = voteController;

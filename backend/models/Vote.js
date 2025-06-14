const pool = require('../config/database');
const User = require('./User');

class Vote {
    // Add a vote to a ticket (either upvote or downvote)
    static async addTicketVote(userId, ticketId, voteType) {
        try {
            // Check if user already has a vote for this ticket
            const [existingVote] = await pool.execute(
                'SELECT * FROM user_votes_tickets WHERE user_id = ? AND ticket_id = ?',
                [userId, ticketId]
            );

            if (existingVote.length > 0) {
                if (existingVote[0].vote_type === voteType) {
                    // If voting the same way, remove the vote
                    await this.removeTicketVote(userId, ticketId);
                    return { action: 'removed', previous: voteType };
                } else {
                    // If changing vote, update it
                    await pool.execute(
                        'UPDATE user_votes_tickets SET vote_type = ? WHERE user_id = ? AND ticket_id = ?',
                        [voteType, userId, ticketId]
                    );
                    
                    // Update ticket vote counts
                    if (voteType === 'upvote') {
                        await pool.execute(
                            'UPDATE tickets SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ?',
                            [ticketId]
                        );
                    } else {
                        await pool.execute(
                            'UPDATE tickets SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ?',
                            [ticketId]
                        );
                    }
                    // Get the ticket author's ID to update their reputation
                    const [ticketResult] = await pool.execute(
                        'SELECT author_id FROM tickets WHERE id = ?',
                        [ticketId]
                    );

                    
                    if (ticketResult.length > 0 && ticketResult[0].author_id) {

                        // Update the author's reputation
                        await User.calculateAndUpdateReputation(ticketResult[0].author_id);
                    } else {
                        console.warn(`No valid author_id found for ticket ${ticketId}`);
                    }
                    
                    return { action: 'changed', previous: existingVote[0].vote_type, new: voteType };
                }
            } else {
                // Add new vote
                await pool.execute(
                    'INSERT INTO user_votes_tickets (user_id, ticket_id, vote_type) VALUES (?, ?, ?)',
                    [userId, ticketId, voteType]
                );
                
                // Update ticket vote count
                if (voteType === 'upvote') {
                    await pool.execute(
                        'UPDATE tickets SET upvotes = upvotes + 1 WHERE id = ?',
                        [ticketId]
                    );
                } else {
                    await pool.execute(
                        'UPDATE tickets SET downvotes = downvotes + 1 WHERE id = ?',
                        [ticketId]
                    );
                }
                
                // Get the ticket author's ID to update their reputation
                const [ticketResult] = await pool.execute(
                    'SELECT author_id FROM tickets WHERE id = ?',
                    [ticketId]
                );
                
                if (ticketResult.length > 0) {
                    // Update the author's reputation
                    await User.calculateAndUpdateReputation(ticketResult[0].author_id);
                }
                
                return { action: 'added', new: voteType };
            }
        } catch (error) {
            console.error('Error in ticket vote operation:', error);
            throw error;
        }
    }

    // Remove a vote from a ticket
    static async removeTicketVote(userId, ticketId) {
        try {
            // Get the vote type before removing
            const [voteResult] = await pool.execute(
                'SELECT vote_type FROM user_votes_tickets WHERE user_id = ? AND ticket_id = ?',
                [userId, ticketId]
            );
            
            if (voteResult.length === 0) {
                return { action: 'none' };
            }
            
            const voteType = voteResult[0].vote_type;
            
            // Remove the vote
            await pool.execute(
                'DELETE FROM user_votes_tickets WHERE user_id = ? AND ticket_id = ?',
                [userId, ticketId]
            );
            
            // Update ticket vote count
            if (voteType === 'upvote') {
                await pool.execute(
                    'UPDATE tickets SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?',
                    [ticketId]
                );
            } else {
                await pool.execute(
                    'UPDATE tickets SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?',
                    [ticketId]
                );
            }
            
            // Get the ticket author's ID to update their reputation after vote removal
            const [ticketResult] = await pool.execute(
                'SELECT author_id FROM tickets WHERE id = ?',
                [ticketId]
            );
            
            if (ticketResult.length > 0) {
                // Update the author's reputation
                await User.calculateAndUpdateReputation(ticketResult[0].author_id);
            }
            
            return { action: 'removed', previous: voteType };
        } catch (error) {
            console.error('Error removing ticket vote:', error);
            throw error;
        }
    }

    // Get all votes by a specific user
    static async getUserVotesForTickets(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT ticket_id, vote_type FROM user_votes_tickets WHERE user_id = ?',
                [userId]
            );
            
            // Convert to a more useful format for the frontend
            const voteMap = {};
            rows.forEach(vote => {
                voteMap[vote.ticket_id] = vote.vote_type;
            });
            
            return voteMap;
        } catch (error) {
            console.error('Error getting user ticket votes:', error);
            throw error;
        }
    }

    // Add a vote to a reply (either upvote or downvote)
    static async addReplyVote(userId, replyId, voteType) {
        try {
            // Check if user already has a vote for this reply
            const [existingVote] = await pool.execute(
                'SELECT * FROM user_votes_replies WHERE user_id = ? AND reply_id = ?',
                [userId, replyId]
            );

            if (existingVote.length > 0) {
                if (existingVote[0].vote_type === voteType) {
                    // If voting the same way, remove the vote
                    await this.removeReplyVote(userId, replyId);
                    return { action: 'removed', previous: voteType };
                } else {
                    // If changing vote, update it
                    await pool.execute(
                        'UPDATE user_votes_replies SET vote_type = ? WHERE user_id = ? AND reply_id = ?',
                        [voteType, userId, replyId]
                    );
                    
                    // Update reply vote counts
                    if (voteType === 'upvote') {
                        await pool.execute(
                            'UPDATE replies SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ?',
                            [replyId]
                        );
                    } else {
                        await pool.execute(
                            'UPDATE replies SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ?',
                            [replyId]
                        );
                    }
                    // Get the reply author's ID to update their reputation
                    const [replyResult] = await pool.execute(
                        'SELECT author_id FROM replies WHERE id = ?',
                        [replyId]
                    );

                    
                    if (replyResult.length > 0 && replyResult[0].author_id) {

                        // Update the author's reputation
                        await User.calculateAndUpdateReputation(replyResult[0].author_id);
                    } else {
                        console.warn(`No valid author_id found for reply ${replyId}`);
                    }
                    
                    return { action: 'changed', previous: existingVote[0].vote_type, new: voteType };
                }
            } else {
                // Add new vote
                await pool.execute(
                    'INSERT INTO user_votes_replies (user_id, reply_id, vote_type) VALUES (?, ?, ?)',
                    [userId, replyId, voteType]
                );
                
                // Update reply vote count
                if (voteType === 'upvote') {
                    await pool.execute(
                        'UPDATE replies SET upvotes = upvotes + 1 WHERE id = ?',
                        [replyId]
                    );
                } else {
                    await pool.execute(
                        'UPDATE replies SET downvotes = downvotes + 1 WHERE id = ?',
                        [replyId]
                    );
                }
                
                // Get the reply author's ID to update their reputation
                const [replyResult] = await pool.execute(
                    'SELECT author_id FROM replies WHERE id = ?',
                    [replyId]
                );
                
                if (replyResult.length > 0) {
                    // Update the author's reputation
                    await User.calculateAndUpdateReputation(replyResult[0].author_id);
                }
                
                return { action: 'added', new: voteType };
            }
        } catch (error) {
            console.error('Error in reply vote operation:', error);
            throw error;
        }
    }

    // Remove a vote from a reply
    static async removeReplyVote(userId, replyId) {
        try {
            // Get the vote type before removing
            const [voteResult] = await pool.execute(
                'SELECT vote_type FROM user_votes_replies WHERE user_id = ? AND reply_id = ?',
                [userId, replyId]
            );
            
            if (voteResult.length === 0) {
                return { action: 'none' };
            }
            
            const voteType = voteResult[0].vote_type;
            
            // Remove the vote
            await pool.execute(
                'DELETE FROM user_votes_replies WHERE user_id = ? AND reply_id = ?',
                [userId, replyId]
            );
            
            // Update reply vote count
            if (voteType === 'upvote') {
                await pool.execute(
                    'UPDATE replies SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?',
                    [replyId]
                );
            } else {
                await pool.execute(
                    'UPDATE replies SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?',
                    [replyId]
                );
            }
            
            // Get the reply author's ID to update their reputation after vote removal
            const [replyResult] = await pool.execute(
                'SELECT author_id FROM replies WHERE id = ?',
                [replyId]
            );
            
            if (replyResult.length > 0) {
                // Update the author's reputation
                await User.calculateAndUpdateReputation(replyResult[0].author_id);
            }
            
            return { action: 'removed', previous: voteType };
        } catch (error) {
            console.error('Error removing reply vote:', error);
            throw error;
        }
    }

    // Get all reply votes by a specific user
    static async getUserVotesForReplies(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT reply_id, vote_type FROM user_votes_replies WHERE user_id = ?',
                [userId]
            );
            
            // Convert to a more useful format for the frontend
            const voteMap = {};
            rows.forEach(vote => {
                voteMap[vote.reply_id] = vote.vote_type;
            });
            
            return voteMap;
        } catch (error) {
            console.error('Error getting user reply votes:', error);
            throw error;
        }
    }
}

module.exports = Vote;

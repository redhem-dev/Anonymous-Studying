const pool = require('../config/database');
const crypto = require('crypto');

class User {
    static hashEmail(email) {
        return crypto.createHash('sha256').update(email).digest('hex');
    }

    static async findByEmailHash(emailHash) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email_hash = ?',
            [emailHash]
        );
        return rows[0];
    }

    static async create(emailHash, username) {
        const [result] = await pool.execute(
            `INSERT INTO users (email_hash, username, created_at, last_login)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [emailHash, username]
        );
        
        return result.insertId;
    }

    static async updateLastLogin(userId) {
        await pool.execute(
            `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
            [userId]
        );
    }
    
    static async updateNotificationsLastChecked(userId) {
        try {
            // Check if user exists first
            const [userCheck] = await pool.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (!userCheck || userCheck.length === 0) {
                return false;
            }
            
            // Perform the update
            const [result] = await pool.execute(
                `UPDATE users SET notifications_last_checked = CURRENT_TIMESTAMP WHERE id = ?`,
                [userId]
            );
            
            return result && result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating notifications_last_checked:', error);
            return false;
        }
    }
    
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT id FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by username:', error);
            return null;
        }
    }
    
    static async changeUsername(userId, newUsername) {
        try {
            // First check if the username is already taken
            const existingUser = await this.findByUsername(newUsername);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Username already taken');
            }
            
            const [result] = await pool.execute(
                'UPDATE users SET username = ? WHERE id = ?',
                [newUsername, userId]
            );
            
            return result && result.affectedRows > 0;
        } catch (error) {
            console.error('Error changing username:', error);
            throw error;
        }
    }
    
    static async calculateAndUpdateReputation(userId) {
        try {
            
            // Get all votes for tickets authored by this user
            const [ticketVotes] = await pool.execute(
                `SELECT COALESCE(SUM(upvotes), 0) as total_upvotes, COALESCE(SUM(downvotes), 0) as total_downvotes 
                 FROM tickets 
                 WHERE author_id = ?`,
                [userId]
            );
            
            // Get all votes for replies authored by this user
            const [replyVotes] = await pool.execute(
                `SELECT COALESCE(SUM(upvotes), 0) as total_upvotes, COALESCE(SUM(downvotes), 0) as total_downvotes 
                 FROM replies 
                 WHERE author_id = ?`,
                [userId]
            );
            
            // Parse the results as numbers (ensure we don't get null or undefined)
            const ticketUpvotes = parseInt(ticketVotes[0].total_upvotes) || 0;
            const ticketDownvotes = parseInt(ticketVotes[0].total_downvotes) || 0;
            const replyUpvotes = parseInt(replyVotes[0].total_upvotes) || 0;
            const replyDownvotes = parseInt(replyVotes[0].total_downvotes) || 0;
            
            // Calculate total upvotes and downvotes
            const totalUpvotes = ticketUpvotes + replyUpvotes;
            const totalDownvotes = ticketDownvotes + replyDownvotes;
            const totalVotes = totalUpvotes + totalDownvotes;

            
            // Start with default reputation of 50%
            let reputation = 50;
            
            // Only calculate if there are votes
            if (totalVotes > 0) {
                // Calculate reputation as percentage of upvotes to total votes
                const percentage = (totalUpvotes / totalVotes) * 100;
                reputation = Math.round(percentage);
            }
            
            // Ensure reputation is between 1-100
            reputation = Math.max(1, Math.min(100, reputation));
            
            // Force reputation to be an integer to avoid any type conversion issues
            const reputationInteger = parseInt(reputation, 10);
            
            // Update reputation in database with explicit casting
            const [updateResult] = await pool.execute(
                'UPDATE users SET reputation = ? WHERE id = ?',
                [reputationInteger, userId]
            );
            
            // Verify the update by reading back the value from the database
            const [verifyResult] = await pool.execute(
                'SELECT reputation FROM users WHERE id = ?',
                [userId]
            );
            
            if (verifyResult.length > 0) {
                // Ensure we're dealing with a proper integer value from database
                const storedReputation = parseInt(verifyResult[0].reputation, 10);
                
                // If there's a mismatch, log a warning
                if (storedReputation !== reputationInteger) {
                    console.warn(`Reputation mismatch! Calculated ${reputationInteger} but stored as ${storedReputation}`);
                    
                    // If stored value is 1 but calculated value is different, try force update
                    if (storedReputation === 1 && reputationInteger > 1) {
                        console.warn('Detected invalid reputation of 1, forcing update with explicit query');
                        await pool.execute(
                            'UPDATE users SET reputation = ? WHERE id = ?',
                            [reputationInteger, userId]
                        );
                    }
                }
                
                // Return the calculated value to ensure consistency with our code
                return reputationInteger;
            }
            
            return reputation;
        } catch (error) {
            console.error('Error calculating user reputation:', error);
            return 50; // Return default on error instead of null
        }
    }
    
    /**
     * Get user profile data for the popup display
     * @param {string} username The username to look up
     * @returns {Object} User profile data including reputation and ticket count
     */
    static async getProfileForPopup(username) {
        try {
            // Find the user by username
            const [userRows] = await pool.execute(
                'SELECT id, username, created_at, reputation FROM users WHERE username = ?',
                [username]
            );
            
            if (userRows.length === 0) {
                return null;
            }
            
            const user = userRows[0];
            
            // Get ticket count for this user
            const [ticketCountResult] = await pool.execute(
                'SELECT COUNT(*) as ticket_count FROM tickets WHERE author_id = ?',
                [user.id]
            );
            
            // Get reply count for this user
            const [replyCountResult] = await pool.execute(
                'SELECT COUNT(*) as reply_count FROM replies WHERE author_id = ?',
                [user.id]
            );
            
            return {
                username: user.username,
                joinDate: user.created_at,
                reputation: parseInt(user.reputation, 10) || 50, // Ensure it's a number
                ticketCount: ticketCountResult[0].ticket_count,
                replyCount: replyCountResult[0].reply_count
            };
        } catch (error) {
            console.error('Error getting user profile for popup:', error);
            return null;
        }
    }

    static async findById(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    static async changeUsername(userId, newUsername) {
        await pool.execute(
            `UPDATE users SET username = ? WHERE id = ?`,
            [newUsername, userId]
        );
    }
}

module.exports = User;

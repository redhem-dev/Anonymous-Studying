const pool = require('../config/database');

class Ticket {
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT t.*, u.username as author_username, tp.name as topic_name 
            FROM tickets t
            LEFT JOIN users u ON t.author_id = u.id
            LEFT JOIN topics tp ON t.topic_id = tp.id
            ORDER BY t.created_at DESC
        `);
        return rows;
    }
    
    static async getAllByUserId(userId) {
        const [rows] = await pool.query(`
            SELECT t.*, u.username as author_username, tp.name as topic_name,
            (SELECT COUNT(*) FROM replies r WHERE r.ticket_id = t.id) as reply_count
            FROM tickets t
            LEFT JOIN users u ON t.author_id = u.id
            LEFT JOIN topics tp ON t.topic_id = tp.id
            WHERE t.author_id = ?
            ORDER BY t.created_at DESC
        `, [userId]);
        return rows;
    }
    
    static async searchByTitle(searchTerm) {
        const searchQuery = `%${searchTerm}%`;
        
        // Search for tickets that match title, body, topic name, or tags
        const [ticketRows] = await pool.query(`
            SELECT DISTINCT t.*, u.username as author_username, tp.name as topic_name 
            FROM tickets t
            LEFT JOIN users u ON t.author_id = u.id
            LEFT JOIN topics tp ON t.topic_id = tp.id
            LEFT JOIN ticket_tags tt ON t.id = tt.ticket_id
            LEFT JOIN tags tag ON tt.tag_id = tag.id
            WHERE t.title LIKE ?
            OR t.body LIKE ?
            OR tp.name LIKE ?
            OR tag.name LIKE ?
            ORDER BY t.created_at DESC
        `, [searchQuery, searchQuery, searchQuery, searchQuery]);
        
        return {
            tickets: ticketRows
        };
    }

    static async findById(id) {
        const [rows] = await pool.query("SELECT * FROM tickets WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(title, body, topicId, authorId, imageBuffer = null) {
        const [result] = await pool.execute(
            `INSERT INTO tickets (title, body, topic_id, author_id, created_at, image)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
            [title, body, topicId, authorId, imageBuffer]
        );
        
        return result.insertId;
    }

    static async update(ticketId, newTitle, newBody, newImageBuffer = null) {
        await pool.execute(
            `UPDATE tickets 
            SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP, image = ?
            WHERE id = ?`,
            [newTitle, newBody, newImageBuffer, ticketId]
        );
    }

    static async delete(ticketId) {
        await pool.execute(
            `DELETE FROM tickets WHERE id = ?`,
            [ticketId]
        );
    }

    static async increaseUpvote(ticketId) {
        await pool.execute(
            `UPDATE tickets SET upvotes = upvotes + 1 WHERE id = ?`,
            [ticketId]
        );
    }

    static async decreaseUpvote(ticketId) {
        await pool.execute(
            `UPDATE tickets SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?`,
            [ticketId]
        );
    }
    
    static async increaseDownvote(ticketId) {
        await pool.execute(
            `UPDATE tickets SET downvotes = downvotes + 1 WHERE id = ?`,
            [ticketId]
        );
    }
    
    static async decreaseDownvote(ticketId) {
        await pool.execute(
            `UPDATE tickets SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?`,
            [ticketId]
        );
    }

    static async getAllByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM tickets WHERE author_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async getAllFavoritesByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT t.*
            FROM tickets t
            JOIN favorites f ON t.id = f.ticket_id
            WHERE f.user_id = ?`,
            [userId]
        );
        return rows;
    }

    static async addToFavorites(userId, ticketId) {
        await pool.query(
            `INSERT IGNORE INTO favorites (user_id, ticket_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [userId, ticketId]
        );
    }

    static async removeFromFavorites(userId, ticketId) {
        await pool.query(
            `DELETE FROM favorites WHERE user_id = ? AND ticket_id = ?`,
            [userId, ticketId]
        );
    }
}

module.exports = Ticket;

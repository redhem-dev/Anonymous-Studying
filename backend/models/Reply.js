const pool = require('../config/database');

class Reply {
    static async create(ticketId, authorId, body, image = null) {
        const [result] = await pool.query(
            'INSERT INTO replies (ticket_id, author_id, body, created_at, image) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
            [ticketId, authorId, body, image]
        );
        return result.insertId;
    }

    static async getAllByTicketId(ticketId) {
        const [rows] = await pool.query(
            `SELECT r.*, u.username as author_username 
            FROM replies r
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.ticket_id = ?`,
            [ticketId]
        );
        return rows;
    }

    static async findById(replyId) {
        const [rows] = await pool.query(
            'SELECT * FROM replies WHERE id = ?',
            [replyId]
        );
        return rows[0] || null;
    }

    static async update(replyId, newBody, newImageBuffer = null) {
        await pool.query(
            'UPDATE replies SET body = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newBody, newImageBuffer, replyId]
        );
    }

    static async delete(replyId) {
        await pool.query(
            'DELETE FROM replies WHERE id = ?',
            [replyId]
        );
    }

    static async increaseUpvote(replyId) {
        await pool.query(
            'UPDATE replies SET upvotes = upvotes + 1 WHERE id = ?',
            [replyId]
        );
    }

    static async decreaseUpvote(replyId) {
        await pool.query(
            'UPDATE replies SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?',
            [replyId]
        );
    }

    static async increaseDownvote(replyId) {
        await pool.query(
            'UPDATE replies SET downvotes = downvotes + 1 WHERE id = ?',
            [replyId]
        );
    }

    static async decreaseDownvote(replyId) {
        await pool.query(
            'UPDATE replies SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?',
            [replyId]
        );
    }
}

module.exports = Reply;

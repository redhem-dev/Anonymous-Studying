const pool = require('../config/database');

class Topic {
    // Get all topics
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT * FROM topics
            ORDER BY name ASC
        `);
        return rows;
    }

    // Get a topic by ID
    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT * FROM topics
            WHERE id = ?
        `, [id]);
        return rows[0];
    }

    // Create a new topic
    static async create(name, description = null) {
        const [result] = await pool.execute(
            `INSERT INTO topics (name, description, created_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [name, description]
        );
        
        return result.insertId;
    }

    // Update a topic
    static async update(id, name, description = null) {
        await pool.execute(
            `UPDATE topics 
            SET name = ?, description = ?
            WHERE id = ?`,
            [name, description, id]
        );
    }

    // Delete a topic
    static async delete(id) {
        await pool.execute(
            `DELETE FROM topics WHERE id = ?`,
            [id]
        );
    }

    // Increment the ticket count for a topic
    static async incrementTicketCount(id) {
        await pool.execute(
            `UPDATE topics SET ticket_count = ticket_count + 1 WHERE id = ?`,
            [id]
        );
    }

    // Decrement the ticket count for a topic
    static async decrementTicketCount(id) {
        await pool.execute(
            `UPDATE topics SET ticket_count = GREATEST(ticket_count - 1, 0) WHERE id = ?`,
            [id]
        );
    }
}

module.exports = Topic;

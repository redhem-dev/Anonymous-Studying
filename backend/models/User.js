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

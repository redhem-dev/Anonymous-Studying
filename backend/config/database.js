import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

/*const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "ticket_support_system"
}).promise();*/

// Wrap async code in a function
async function run() {
    const result = await pool.query('SELECT * FROM users');
    console.log(result[0]);
}

//----------------- USERS -------------------------
//CHECK WITH @Edhem
export function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

export async function findUserByEmailHash(emailHash) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email_hash = ?',
      [emailHash]
    );
    return rows[0];
}

export async function createUser(emailHash, username) {
    const [result] = await pool.execute(
        `INSERT INTO users (email_hash, username, created_at, last_login)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [emailHash, username]
    );
    
    return result.insertId;
}

export async function updateLastLogin(userId) {
    await pool.execute(
        `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
        [userId]
    );
}

export async function getUserById(userId) {
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    );
    return rows[0];
}

export async function changeUsername(userId, newUsername) {
    await pool.execute(
        `UPDATE users SET username = ? WHERE id = ?`,
        [newUsername, userId]
    );
}




//----------------- TICKETS -----------------------
export async function getTickets() {
    const [rows] = await pool.query("SELECT * FROM tickets");
    return rows;
}

export async function getTicketById(id) {
    const [rows] = await pool.query("SELECT * FROM tickets WHERE id = ?", [id]);
    return rows[0];
}

//CHECK IMAGE BUFFER
export async function createTicket(title, body, topicId, authorId, imageBuffer = null) {
    const [result] = await pool.execute(
        `INSERT INTO tickets (title, body, topic_id, author_id, created_at, image)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
        [title, body, topicId, authorId, imageBuffer]
    );
    
    return result.insertId;
}

export async function editTicket(ticketId, newTitle, newBody, newImageBuffer = null) {
    await pool.execute(
      `UPDATE tickets 
       SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP, image = ?
       WHERE id = ?`,
      [newTitle, newBody, newImageBuffer, ticketId]
    );
}

export async function deleteTicket(ticketId) {
    await pool.execute(
      `DELETE FROM tickets WHERE id = ?`,
      [ticketId]
    );
}

export async function increaseUpvoteOnTicket(ticketId) {
    await pool.execute(
      `UPDATE tickets SET upvotes = upvotes + 1 WHERE id = ?`,
      [ticketId]
    );
}

//GREATEST(..., 0) ensures that the vote counts don't go below zero
export async function decreaseUpvoteOnTicket(ticketId) {
    await pool.execute(
      `UPDATE tickets SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?`,
      [ticketId]
    );
}
  
export async function increaseDownvoteOnTicket(ticketId) {
    await pool.execute(
      `UPDATE tickets SET downvotes = downvotes + 1 WHERE id = ?`,
      [ticketId]
    );
}
  
export async function decreaseDownvoteOnTicket(ticketId) {
    await pool.execute(
      `UPDATE tickets SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?`,
      [ticketId]
    );
}

//Tickets by user's id
export async function getAllUsersTicketsByID(userId) {
    const [rows] = await pool.query(
        `SELECT * FROM tickets WHERE author_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
}

//FAVORITES
export async function getAllUsersFavoriteTicketsByID(userId) {
    const [rows] = await pool.query(
        `SELECT t.*
         FROM tickets t
         JOIN favorites f ON t.id = f.ticket_id
         WHERE f.user_id = ?`,
        [userId]
    );
    return rows;
}

export async function addTicketToFavourite(userId, ticketId) {
    await pool.query(
        `INSERT IGNORE INTO favorites (user_id, ticket_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [userId, ticketId]
    );
}

export async function removeTicketFromFavourite(userId, ticketId) {
    await pool.query(
        `DELETE FROM favorites WHERE user_id = ? AND ticket_id = ?`,
        [userId, ticketId]
    );
}



//----------------- REPLIES -------------------------
export async function createReply(ticketId, authorId, body, image = null) {
    const [result] = await pool.query(
        'INSERT INTO replies (ticket_id, author_id, body, created_at, image) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
        [ticketId, authorId, body, image]
    );
    return result.insertId;
}

export async function getAllReplies(ticketId) {
    const [rows] = await pool.query(
        'SELECT * FROM replies WHERE ticket_id = ?',
        [ticketId]
    );
    return rows;
}

export async function getReplyByID(replyId) {
    const [rows] = await pool.query(
        'SELECT * FROM replies WHERE id = ?',
        [replyId]
    );
    return rows[0] || null;
}

export async function editReply(replyId, newBody, newImageBuffer = null) {
    await pool.query(
        'UPDATE replies SET body = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBody, newImageBuffer, replyId]
    );
}

export async function deleteReply(replyId) {
    await pool.query(
        'DELETE FROM replies WHERE id = ?',
        [replyId]
    );
}

export async function increaseUpvoteOnReply(replyId) {
    await pool.query(
        'UPDATE replies SET upvotes = upvotes + 1 WHERE id = ?',
        [replyId]
    );
}

export async function increaseDownvoteOnReply(replyId) {
    await pool.query(
        'UPDATE replies SET downvotes = downvotes + 1 WHERE id = ?',
        [replyId]
    );
}

export async function decreaseUpvoteOnReply(replyId) {
    await pool.query(
        'UPDATE replies SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?',
        [replyId]
    );
}

export async function decreaseDownvoteOnReply(replyId) {
    await pool.query(
        'UPDATE replies SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?',
        [replyId]
    );
}



await createTicket('Test Ticket', 'Test Body', 1, 1);
const reply = await getTickets();

console.log(reply);  

// Call the function
run().catch(console.error);
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

/*const pool = sql.createPool({
    host: "mysql.railway.internal", //add new
    user: "root", //add new
    password: "jZdCrHEIuagdggHzdpquHWGNjfscupfU", //add new
    database: "railway" //add new
}).promise();*/

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "ticket_support_system"
}).promise();

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



const note = await getTicketById(1);
console.log(note);  

// Call the function
run().catch(console.error);
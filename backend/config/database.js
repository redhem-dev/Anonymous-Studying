const sql = require('mysql2');
require('dotenv').config();

const pool = sql.createPool({
    host: "127.0.0.1", //add new
    user: "root", //add new
    password: "szoboszlai", //add new
    database: "classicmodels" //add new
}).promise();

// Wrap async code in a function
async function run() {
    const result = await pool.query("SELECT * FROM customers");
    console.log(result[0]);
}

// Call the function
run().catch(console.error);
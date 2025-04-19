const sql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = sql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();


//  TESTING ONLY
// async function run() {
//     const result = await pool.query('SELECT * FROM users');
//     console.log(result[0]);
// }

// run().catch(console.error);

module.exports = pool;
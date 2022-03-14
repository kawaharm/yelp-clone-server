const { Pool } = require("pg");

// Connect to postgreSQL 
// pg checks dotenv files for database connection variables 
const pool = new Pool();

module.exports = {
    query: (text, params) => pool.query(text, params),
};
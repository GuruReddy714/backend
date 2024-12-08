const dotenv = require("dotenv");
const { Pool } = require("pg");

// Load .env variables
const result = dotenv.config();
if (result.error) {
    console.error("Error loading .env file:", result.error);
} else {
    console.log(".env file loaded successfully");
}

// Debugging: Log the connection string
console.log("Connecting to database with:", process.env.SUPABASE_CONNECTION_STRING);

// Configure PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.SUPABASE_CONNECTION_STRING,
    ssl: false, // Disable SSL for Supabase
});

module.exports = pool;
const { Client } = require('pg');

console.log("init-db.js is running");

// Supabase connection string (from environment variable)
const connectionString = process.env.SUPABASE_CONNECTION_STRING;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Ensure SSL is enabled for Supabase
  },
});

// Connect to Supabase PostgreSQL server
client.connect()
  .then(async () => {
    console.log("Connected to Supabase PostgreSQL server.");

    // Example of running schema or initialization tasks
    // Uncomment and update as needed
    // const schema = `
    //   CREATE TABLE IF NOT EXISTS example_table (
    //     id SERIAL PRIMARY KEY,
    //     name TEXT NOT NULL
    //   );
    // `;
    // await client.query(schema);

    console.log('Initialization tasks completed successfully.');
    await client.end();
  })
  .catch(err => {
    console.error('Failed to connect to Supabase PostgreSQL:', err);
    client.end();
  });

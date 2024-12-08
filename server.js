const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const db_query = require('./database.js'); // Use updated database connection

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Endpoint to check user balance
app.get('/wallet/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const result = await db_query.query('SELECT user_id, available_balance, current_softblock FROM public.member_wallet WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database query error" });
    }
});

// Endpoint to add funds to wallet
app.post('/wallet/add-funds', async (req, res) => {
    const { user_id, amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    try {
        const result = await db_query.query(
            'UPDATE public.member_wallet SET available_balance = available_balance + $1, last_update_time = NOW() WHERE user_id = $2 RETURNING *',
            [amount, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "Funds added successfully", wallet: result.rows[0] });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database query error" });
    }
});

// Endpoint to deduct funds from wallet
app.post('/wallet/deduct-funds', async (req, res) => {
    const { user_id, amount } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    try {
        const balanceResult = await db_query.query(
            'SELECT available_balance, current_softblock FROM public.member_wallet WHERE user_id = $1',
            [user_id]
        );
        if (balanceResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const { available_balance, current_softblock } = balanceResult.rows[0];
        if (available_balance - current_softblock < amount) {
            return res.status(400).json({ error: "Insufficient available balance" });
        }
        const result = await db_query.query(
            'UPDATE public.member_wallet SET available_balance = available_balance - $1, last_update_time = NOW() WHERE user_id = $2 RETURNING *',
            [amount, user_id]
        );
        res.json({ message: "Funds deducted successfully", wallet: result.rows[0] });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database query error" });
    }
});

// Endpoint to get transaction history (if required)
app.get('/transaction/history/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const result = await db_query.query(
            'SELECT * FROM transaction_history WHERE user_id = $1 ORDER BY date DESC',
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No transactions found for this user." });
        }
        res.json(result.rows);
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Database query error" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

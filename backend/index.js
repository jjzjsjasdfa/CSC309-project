#!/usr/bin/env node
'use strict';
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const express = require("express");
const app = express();

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRoutes = require("./src/routes/userRoutes");
app.use("/users", userRoutes);

const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

const eventsRoutes = require("./src/routes/eventsRoutes");
app.use("/events", eventsRoutes);

const promotionRoutes = require("./src/routes/promotionRoutes");
app.use("/promotions", promotionRoutes);

const transactionRoutes = require("./src/routes/transactionRoutes");
app.use("/transactions", transactionRoutes);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
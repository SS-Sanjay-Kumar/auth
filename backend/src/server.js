import express from 'express';
import dotenv from 'dotenv/config'
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'

const PORT = process.env.PORT || 3000;
const app = express();

//middleware
app.use(express.json());
app.use(cookieParser()); //parse incoming cookies

//Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, ()=>{
    console.log("codesistency_auth is listening at", PORT);
    connectDB();
});
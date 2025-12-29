import mongoose from "mongoose";
import dotenv from 'dotenv/config.js';

const connectDB = async()=>{
    try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("DB Connected Successfully!");
    } catch (error) {
        console.error("Error connecting to DB", error);
        process.exit(1); //exit with fail code
    }
}

export default connectDB;
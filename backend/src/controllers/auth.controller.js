import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';

import {User} from '../models/User.js';
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
} from '../mailtrap/emails.js';

export async function signup(req, res){

    try {
        const {email, password, name} = req.body;
        if(!email || !password || !name){
            res.status(400).json({
                success:false,
                message:"All fields are mandatory!"
            });
        }

        const userAlreadyExists = await User.findOne({email});
        console.log("User", userAlreadyExists)
        if(userAlreadyExists){
                res.status(400).json({
                success:false,
                message:"User already exists, login with your credentials!"
            });
        }
        //using await is necessary here cause .hash() is CPU intensive 
        // and takes some time for security purposes (i.e intentional)
        const hashedPassword = await bcryptjs.hash(password, 10); //salt -> 10
        
        const verificationToken = Math.floor(100000+ Math.random() * 900000).toString();

        const user = new User({
            email:email,
            password: hashedPassword,
            name: name,
            verificationToken: verificationToken, // saving the verfication token in the DB 
            verificationTokenExpiresAt: Date.now() + (24  * 60 * 60 * 1000),
        });
        
        await user.save();
        
        generateTokenAndSetCookie(res, user._id);
        res.status(201).json({
            success:true,
            message: "User has been created successfully!",
            user:{
                ...user._doc,
                password: undefined,
            }
        });

        await sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
        console.error("Error in signup", error);
    }
}

export async function verifyEmail(req, res){
    try {
        const {code} = req.body;
        const user = await User.findOne({
            verificationToken:code,
            verificationTokenExpiresAt: {$gt : Date.now()} //gt-> greater then
        });

        if(!user){
            return res.status(400).json({
                success:false,
                message: "Invalid/Expired Verification Code"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt= undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success:true,
            message: "Email verification successful",
            user:{
                ... user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.error("Error in signup route: ", error);
        res.status(500).json({
            success:false,
            message: "Error during signup"
        });
    }
}

export async function login(req, res){
    res.send("Login route");
}

export async function logout(req, res){
    res.send("Logout route");
}

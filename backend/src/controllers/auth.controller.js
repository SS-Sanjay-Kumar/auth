import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv/config.js'

import { User } from '../models/User.js';
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail,
} from '../mailtrap/emails.js';

export async function signup(req, res) {

    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: "All fields are mandatory!"
            });
        }

        const userAlreadyExists = await User.findOne({ email });
        console.log("User", userAlreadyExists)
        if (userAlreadyExists) {
            res.status(400).json({
                success: false,
                message: "User already exists, login with your credentials!"
            });
        }
        //using await is necessary here cause .hash() is CPU intensive 
        // and takes some time for security purposes (i.e intentional)
        const hashedPassword = await bcryptjs.hash(password, 10); //salt -> 10

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
            verificationToken: verificationToken, // saving the verfication token in the DB 
            verificationTokenExpiresAt: Date.now() + (24 * 60 * 60 * 1000),
        });

        await user.save();

        generateTokenAndSetCookie(res, user._id);
        res.status(201).json({
            success: true,
            message: "User has been created successfully!",
            user: {
                ...user._doc,
                password: undefined,
            }
        });

        await sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
        console.error("Error in signup", error);
        res.status(500).json({
            success: false,
            message: "Error during signup"
        });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { code } = req.body;
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() } //gt-> greater then
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid/Expired Verification Code"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verification successful",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.error("Error in verifyEmail route: ", error);
        res.status(500).json({
            success: false,
            message: "Error during verifyEmail"
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Username"
            });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = Date.now();
        user.save();

        res.status(200).json({
            success: true,
            message: "User login successful",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
    } catch (error) {
        console.error("Error in login route: ", error);
        res.status(500).json({
            success: false,
            message: "Error during login"
        });
    }
}

export async function logout(req, res) {
    res.clearCookie("token");
    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found !"
            })
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // valid for 1 hr

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json(
            {
                success: true,
                message: "Password reset mail has been sent to your inbox!"
            }
        )
    } catch (error) {
        console.error("Error in forgotPassword ", error);
        res.status(500).json({
            success: false,
            message: "Error in forgotPassword"
        })
    }
}

export async function resetPassword(req, res) {

    try {
        const { resetToken } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpiresAt: { $gt: Date.now() },
        })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid/Expired Reset URL"
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 10); //salt -> 10
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();
        await sendPasswordResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Your account password has been reset!",
            user: {
                ...user._doc,
                password: undefined,
            },
        })

    } catch (error) {
        console.error("Error in resetPassword, ", error);
        res.status(500).json({
            success: false,
            message: "Error in resetPassword",
        })
    }
}

export async function checkAuth(req, res) {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
                user: {
                    ...user._doc,
                    password: undefined,
                },
            });
        }
        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("Error in checkAuth");
        res.status(500).json({ success: false, message: "Error during checking auth" });
    }
}
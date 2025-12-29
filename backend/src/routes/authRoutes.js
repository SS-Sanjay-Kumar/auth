import express from 'express';

import {
    signup,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);


export default router;
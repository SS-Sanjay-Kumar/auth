import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import {
    signup,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);


export default router;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv/config.js';

export const verifyToken = (req, res, next) => {
    const token  = req.cookies.token; // this requires the cookieParser middleware
    try {
        if (!token) {
            return res.status(401).json({
                sucess: false,
                message: "Unauthorized, no token provided",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //decoded value contains the userId, iat(issued at time) and exp(expiration time)
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid Token",
            });
        }
        //retrieving the userId from the JWT
        req.userId = decoded.userId;
        next()

    } catch (error) {
        console.error("Error in verifyToken", error);
        res.status(500).json({
            success: false,
            message: "Server Error in verfying token",
        });
    }
}
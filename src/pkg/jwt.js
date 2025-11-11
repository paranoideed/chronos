import jwt from 'jsonwebtoken';

//Function kind like `=>` usually dosent exports and usually uses like anonym
export function generateToken(userId) {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

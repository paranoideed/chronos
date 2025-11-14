import jwt from 'jsonwebtoken';

export default function generateToken(userId) {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

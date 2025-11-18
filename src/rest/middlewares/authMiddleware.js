export function createAuthMiddleware({ jwtLib, jwtSecret }) {
    return function authMiddleware(req, res, next) {
        const authHeader = req.headers.authorization || "";
        if (!authHeader)
            return res
                .status(401)
                .json({ error: "Authorization header missing" });

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;
        if (!token) return res.status(401).json({ error: "Token missing" });
        
        try {
            const payload = jwtLib.verify(token, jwtSecret);
            console.log("JWT payload:", payload);
            req.user = { id: payload.id };
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
}

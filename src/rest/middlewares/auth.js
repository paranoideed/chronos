export function auth({ jwtLib, secret = process.env.JWT_SECRET }) {
    if (!jwtLib) {
        throw new Error("auth middleware requires jwtLib");
    }
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || "";
            if (!authHeader)
                return res
                    .status(401)
                    .json({ error: "Authorization header missing" });

            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : null;
            if (!token) return res.status(401).json({ error: "Token missing" });

            req.user = jwtLib.verify(token, secret);
            
            // const user = await usersRepo.findById(req.user.id).lean();
            // if (!user) return res.status(401).json({ message: "Unauthorized" });
            next();
        } catch (e) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    };
}

import jwt from "jsonwebtoken";

export const authRequired = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        if (!authHeader) {
            return res
                .status(401)
                .json({ error: "Authorization header missing" });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;
        if (!token) {
            return res.status(401).json({ error: "Token missing" });
        }

        // const user = await Users.findById(payload.id).lean(); <-- Never do this is very big load for db
        // if (!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = jwt.verify(token, process.env.JWT_SECRET); // Attach user info to request object

        next();
    } catch (e) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

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

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).lean();
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = { id: String(user._id) };
        next();
    } catch (e) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

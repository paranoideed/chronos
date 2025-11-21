import multer from "multer";

const uploader = multer({
    storage: multer.memoryStorage(),
}).single("avatar");

export default function uploadAvatarMiddleware(req, res, next) {
    uploader(req, res, (err) => {
        if (!err) {
            if (!req.file) {
                return res.status(400).json({ message: "File 'avatar' is required" });
            }
            return next();
        }

        return res.status(400).json({ message: err.message || "Upload error" });
    });
}

import {Router} from "express";
import uploadAvatarMiddleware from "../middlewares/uploadAvatarMiddleware.js";
import authMiddleware  from "../middlewares/authMiddleware.js";

export default function userRouter(userController) {
    const router = new Router();

    router.get(
        "/me",
        authMiddleware,
        async (req, res, next) => {
            await userController.getMyUser(req, res, next);
        }
    );

    router.put(
        "/me",
        authMiddleware,
        async (req, res, next) => {
            await userController.updateUser(req, res, next)
        }
    )

    router.post(
        "/me/avatar",
        authMiddleware,
        uploadAvatarMiddleware,
        async (req, res, next) => {
            await userController.updateUserAvatar(req, res, next)
        }
    )

    router.get(
        "/:id",
        async (req, res, next) => {
            await userController.getUserById(req, res, next);
        }
    )

    router.get(
        "/mail/:email",
        async (req, res, next) => {
            await userController.getUserByEmail(req, res, next);
        }
    )

    return router;
}
import {Router} from "express";

export default function createUserRouter(userController, authMiddleware) {
    const router = new Router();

    router.use(authMiddleware);

    router.get("/me", (req, res, next) => {
        userController.getMyUser(req, res, next);
    });

    router.put("/me", (req, res, next) => {
        userController.updateUser(req, res, next)
    })

    router.put("/me/avatar", (req, res, next) => {
        userController.updateUserAvatar(req, res, next)
    })

    router.get("/:id", (req, res, next) => {
        userController.getUserById(req, res, next);
    })

    router.get("/mail/:email", (req, res, next) => {
        userController.getUserByEmail(req, res, next);
    })

    return router;
}
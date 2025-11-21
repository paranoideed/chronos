import {
    getUserByEmailSchema,
    getUserByIDSchema,
    updateUserAvatarSchema,
    updateUserSchema
} from "../requests/user.js";


export default class UserController {
    userCore

    constructor(userService) {
        this.userService = userService;
    }

    async getMyUser(req, res, next) {
        try {
            const user = await this.userService.getUserById(req.user.id);
            if (!user) {
                return res.status(401).send({
                    error: 'User not found'
                })
            }

            return res.status(200).send(user)
        } catch (error) {
            console.log("Error getting user", error);
            next(error)
        }
    }

    async getUserById(req, res, next) {
        const parsed = getUserByIDSchema.safeParse(req);
        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        try {
            const user = await this.userService.getUserById(req.params.id);
            return res.status(200).send(user);
        } catch (error) {
            console.log("Error getting user", error);
            next(error);
        }
    }

    async getUserByEmail(req, res, next) {
        const parsed = getUserByEmailSchema.safeParse(req);
        if (!parsed) {
            return res.status(400).send("Validation error: ", parsed.error);
        }

        try {
            const user = await this.userService.getUserByEmail(req.params.email);

            return res.status(200).send(user);
        } catch (error) {
            console.log("Error getting user", error);
            next(error);
        }
    }

    async updateUser(req, res, next) {
        if (req.user.id != null) {
            const user = await this.userService.getUserById(req.user.id);
            if (!user) {
                return res.status(401).send("User not found");
            }
        }

        const parsed = updateUserSchema.safeParse(req);
        if (!parsed) {
            return res.status(400).send("Validation error: ", parsed.error);
        }

        try {
            const user = await this.userService.updateUser(req.user.id, {
                name: req.body.name,
                country: req.body.country,
            });
            return res.status(200).send(user);
        } catch (error) {
            console.log("Error updating user", error);
            next(error);
        }
    }

    async updateUserAvatar(req, res, next) {
        try {
            const user = await this.userService.getUserById(req.user.id);
            if (!user) {
                return res.status(401).send("User not found");
            }

            const parsed = updateUserAvatarSchema.safeParse({ avatar: req.file });
            if (!parsed.success) {
                return res.status(400).json(parsed.error);
            }

            const updated = await this.userService.updateUserAvatar(req.user.id, req.file);
            return res.status(200).send(updated);
        } catch (error) {
            console.log("Error updating user", error);
            next(error);
        }
    }
}
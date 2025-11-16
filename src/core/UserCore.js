import {UserNotFoundError} from "./errors/errors.js";

export default class UserCore {
    repo;

    constructor(repo) {
        this.repo = repo;
    }

    async getUserById(userId) {
        const res = await this.repo.users().findById(userId);
        if (!res) {
            throw new UserNotFoundError("User not found");
        }

        return {
            id: res._id,
            name: res.name,
            avatar: res.avatar,
        };
    }

    async getUserByEmail(email) {
        const res = await this.repo.users().findOne({ email: email });
        if (!res) {
            throw new UserNotFoundError("User not found");
        }

        return {
            id: res._id,
            name: res.name,
            avatar: res.avatar,
        };
    }
}

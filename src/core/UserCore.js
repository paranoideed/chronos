import {UserNotFoundError} from "./errors/errors.js";
import mongoose from "mongoose";

const asObjId = (id) => new mongoose.Types.ObjectId(id);

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
            email: res.email,
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
            email: res.email,
            avatar: res.avatar,
        };
    }

    async updateUser(userId, {
        name,
        country,
    }) {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }

        const upd = await this.repo.users().findOneAndUpdate(
            { _id: asObjId(userId) },
            { $set: { name, country } },
        )
        if (!upd) {
            throw new UserNotFoundError("User not found");
        }

        return {
            id: upd._id,
            name: upd.name,
            email: upd.email,
            avatar: upd.avatar,
        };
    }

    async updateAvatar(userId, avatar) {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }

        const upd = await this.repo.users().findOneAndUpdate(
            { _id: asObjId(userId) },
            { $set: { avatar } },
        )
        if (!upd) {
            throw new UserNotFoundError("User not found");
        }

        return {
            id: upd._id,
            name: upd.name,
            email: upd.email,
            avatar: upd.avatar,
        };
    }
}

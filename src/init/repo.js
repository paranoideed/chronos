import mongoose from "mongoose";
import { Repo } from "../repo/repo.js";

export async function initRepo(mongoUri) {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { autoIndex: true });
    }
    const repo = new Repo(mongoUri);
    return { repo, mongoose };
}

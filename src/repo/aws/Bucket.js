import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";

export class Bucket {
    s3;
    bucketName;
    publicBase;

    constructor({
        bucketName,
        region,
        accessKeyId,
        secretAccessKey,
    }) {
        this.bucketName = bucketName;
        this.publicBase = `https://${bucketName}.s3.${region}.amazonaws.com`;

        this.s3 = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async putUserAvatar(userId, data, contentType) {
        const key = `user/${userId}/avatar_${Date.now()}`;

        const body = Buffer.isBuffer(data) ? data : Buffer.from(data);

        await this.s3.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType || "application/octet-stream",
            ContentLength: body.length,
            CacheControl: "public, max-age=31536000, immutable",
        }));

        const url = `${this.publicBase}/${key}`;
        return { key, url };
    }

    async deleteS3Object(key) {
        try {
            await this.s3.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
        } catch (err) {
            console.error(`[S3 Delete Error] Failed to delete key: ${key}`, err);
        }
    }

    getKeyFromUrl(url) {
        if (!url || !url.startsWith(this.publicBase)) {
            return null;
        }
        return url.substring(this.publicBase.length + 1);
    }
}

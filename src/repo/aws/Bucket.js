import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} from "@aws-sdk/client-s3";

export class Bucket {
    S3Client;
    bucketName;
    publicBase;

    constructor({
        bucketName,
        region,
        accessKeyId,
        secretAccessKey,
    }) {
        this.bucketName = bucketName;
        this.publicBase = bucketName;

        this.S3Client = new S3Client({
            region: region,
            credentials: {
                accessKeyId:     accessKeyId,
                secretAccessKey: secretAccessKey,
            },
            publicBase: `https://${bucketName}.s3.${region}.amazonaws.com`,
        })
    }

    async putUserAvatar(userId, data, contentType) {
        const key = `user/${userId}/avatar_${Date.now()}`;

        await this.S3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: data,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
        }));

        const url = `${this}/${key}`;
        return { key, url };
    }

    async deleteS3Object(key) {
        try {
            await this.S3Client.send(new DeleteObjectCommand({
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



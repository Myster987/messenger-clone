import {
    v2 as cloudinary,
    type UploadApiErrorResponse,
    type UploadApiResponse,
} from "cloudinary";

cloudinary.config({
    cloud_name: String(process.env.CLOUDINARY_CLOUD_NAME).trim(),
    api_key: String(process.env.CLOUDINARY_API_KEY).trim(),
    api_secret: String(process.env.CLOUDINARY_API_SECRET).trim(),
    secure: true,
});

async function uploadImageFromBuffer(image: Buffer) {
    const uploadImage = new Promise<UploadApiErrorResponse | UploadApiResponse>(
        (resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        format: "avif",
                        invalidate: true,
                    },
                    (error, result) => {
                        if (error || !result) {
                            console.error(error);
                            console.log(
                                `Error in uploadImage: result = ${JSON.stringify(
                                    result
                                )}`
                            );

                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                )
                .end(image);
        }
    );
    return uploadImage;
}

async function uploadImage(image: File) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadImage = new Promise<UploadApiErrorResponse | UploadApiResponse>(
        (resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        format: "avif",
                        invalidate: true,
                    },
                    (error, result) => {
                        if (error || !result) {
                            console.error(error);
                            console.log(
                                `Error in uploadImage: result = ${JSON.stringify(
                                    result
                                )}`
                            );

                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                )
                .end(buffer);
        }
    );
    return uploadImage;
}

async function uploadMultipleImages(images: File[]) {
    return Promise.all(images.map((image) => uploadImage(image)));
}

async function deleteImagesFromCloudinary(
    publicIds: string[]
): Promise<boolean> {
    if (publicIds.length != 0) {
        return cloudinary.api.delete_resources(publicIds, (err) => {
            if (err) {
                return false;
            } else {
                return true;
            }
        });
    }
    return true;
}

export {
    cloudinary,
    uploadImage,
    uploadImageFromBuffer,
    uploadMultipleImages,
    deleteImagesFromCloudinary,
};

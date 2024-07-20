import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true
});

async function uploadImage(image: File) {
	const arrayBuffer = await image.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	const uploadImage = new Promise<UploadApiErrorResponse | UploadApiResponse>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					format: 'avif',
					invalidate: true
				},
				(error, result) => {
					if (error || !result) {
						console.error(error);
						console.log(`Error in uploadImage: result = ${JSON.stringify(result)}`);

						reject(error);
					} else {
						resolve(result);
					}
				}
			)
			.end(buffer);
	});
	return uploadImage;
}

async function uploadMultipleImages(images: File[]) {
	return Promise.all(images.map((image) => uploadImage(image)));
}

async function deleteImagesFromCloudinary(publicIds: string[]): Promise<boolean> {
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

export { cloudinary, uploadImage, uploadMultipleImages, deleteImagesFromCloudinary };
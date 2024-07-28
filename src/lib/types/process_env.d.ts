export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SECRET_DATABASE_URL: string;
			SECRET_DATABASE_TOKEN: string;
			SECRET_CLOUDINARY_CLOUD_NAME: string;
			SECRET_CLOUDINARY_API_KEY: string;
			SECRET_CLOUDINARY_API_SECRET: string;
		}
	}
}

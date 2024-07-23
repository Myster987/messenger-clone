export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			DATABASE_TOKEN: string;
			API_URL: string;
		}
	}
}

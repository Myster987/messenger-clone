import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { customQueryParams } from '../validation';
import { apiEditUserSchema } from '@/auth/form_schemas';
import { generateId } from '@/auth/generate_id';
import { deleteImagesFromCloudinary, uploadImage } from '../cloudinary';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
	deleteUserProfileImage,
	insertProfileImage,
	queryUserById,
	queryUsersByName
} from '@/db/queries';
import * as schema from '@/db/schema';

export const usersRoute = new Hono()
	.patch(
		':userId',
		zValidator('form', apiEditUserSchema, (result, c) => {
			if (!result.success) {
				console.log(result);

				return c.json(
					{
						success: false
					},
					400
				);
			}
		}),
		async (c) => {
			try {
				const { userId } = c.req.param();
				const body = c.req.valid('form');

				const newUserData: Partial<schema.InsertUsers> = {};
				const userData = await queryUserById.get({ userId });

				// image upload
				const uploadProfileImage = async (userId: string, imageToUpload: File) => {
					const imageToDelete = await deleteUserProfileImage.get({
						userId
					});
					const fileDeleteResult = await deleteImagesFromCloudinary([
						imageToDelete?.publicId || ''
					]);

					if (!fileDeleteResult) {
						throw Error(
							`Something went wrong when deleting user's profile image (user id: ${userId})	`
						);
					}

					const uploadData = await uploadImage(imageToUpload);

					if (!uploadData) {
						return c.json(
							{
								success: false
							},
							400
						);
					}

					const profileImageData = await insertProfileImage.get({
						id: generateId(20),
						imageUrl: uploadData.secure_url,
						publicId: uploadData.public_id,
						userId
					});

					if (!profileImageData) {
						throw Error(
							`Something went wrong when inserting user's profile image (user id: ${userId})	`
						);
					}
				};

				if (typeof body.profileImage != 'string' && typeof body.profileImage != 'undefined') {
					await uploadProfileImage(userId, body.profileImage);
				}

				if (body.fullName != userData?.fullName) {
					newUserData.fullName = body.fullName;
				}

				if (Object.keys(newUserData).length >= 1) {
					const res = await db
						.update(schema.users)
						.set(newUserData)
						.where(eq(schema.users.id, userId))
						.returning();

					if (!res) {
						throw Error(`Something went wrong when updating user with id: ${userId}`);
					}
				}

				return c.json({
					success: true
				});
			} catch (error) {
				console.log(c.req.path, error);
				return c.json(
					{
						success: false
					},
					500
				);
			}
		}
	)
	.get('/by_full_name/:fullName', zValidator('query', customQueryParams(15)), async (c) => {
		try {
			const { fullName } = c.req.param();
			const { limit, offset } = c.req.valid('query');

			const data = await queryUsersByName(fullName, limit, offset);

			return c.json({
				success: true,
				data
			});
		} catch (error) {
			console.log(c.req.path, error);
			return c.json(
				{
					success: false,
					data: null
				},
				500
			);
		}
	});

// import { z } from 'zod';
import { z } from 'zod/v4';

export const addMembersToGroup = z.object({
	addedById: z.string().min(1).max(32).trim(),
	newUserIds: z
		.array(z.string().min(1).max(32).trim())
		.min(1, 'Please select at least one new member')
});

export const createGroupSchema = z.object({
	groupName: z
		.string()
		.min(1, 'Group name is required')
		.max(255, 'Max lenght is 255 characters')
		.trim(),
	creatorId: z.string().min(1).max(32).trim(),
	userIds: z.array(z.string().min(1).max(32).trim()).min(1, 'Please select at least one member')
});

export const messageInputSchema = z.object({
	senderId: z.string().min(1).max(32).trim(),
	text: z
		.string()
		.min(1, 'Message is required.')
		.max(10000, 'Your message is too long (max 10 000 characters). Please send smaller ones')
		.trim()
});

export const imageInputSchema = z.object({
	senderId: z.string().min(1).max(32).trim(),
	image: z
		.file({ error: 'Please select file to submit.' })
		.refine((file) => file.size > 0, 'Image must have more that 0 kb')
});

export const signUpFormSchema = z
	.object({
		fullName: z
			.string()
			.min(2, 'At least 1 character')
			.max(128, 'Full name is too long (Max 128 characters)')
			.trim(),
		email: z
			.string()
			.min(3, 'At least 3 characters')
			.max(128, 'Email is too long (Max 128 characters)')
			.email('Invalid email'),
		password: z
			.string()
			.min(6, 'Password must to be at least 6 chacracters long')
			.max(255, 'Password is too long (Max 255 characters)')
			.trim(),
		confirmPassword: z.string().trim()
	})
	.superRefine((val, ctx) => {
		if (val.password !== val.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Password and password confirm do not match',
				path: ['confirmPassword']
			});
		}
	});

export const signInFormSchema = z.object({
	email: z
		.string()
		.min(3, 'At least 3 characters')
		.max(128, 'Email is too long (Max 128 characters)')
		.email('Invalid email'),
	password: z
		.string()
		.min(6, 'Password must to be at least 6 chacracters long')
		.max(255, 'Password is too long (Max 255 characters)')
		.trim()
});

export const editUserSchema = z.object({
	fullName: z
		.string()
		.min(2, 'At least 1 character')
		.max(128, 'Full name is too long (Max 128 characters)'),
	profileImage: z
		.file({ error: 'Image is required' })
		.refine((file) => file.size > 0, 'Image should have more than 0 kb')
		.optional()
});

export const apiEditUserSchema = z.object({
	fullName: z
		.string()
		.min(2, 'At least 1 character')
		.max(128, 'Full name is too long (Max 128 characters)'),
	profileImage: z
		.file({ error: 'Image is required' })
		.refine((file) => file.size > 0, 'Image should have more than 0 kb')
		.or(z.string())
		.optional()
});

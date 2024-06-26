import { z } from 'zod';

export const signUpFormSchema = z
	.object({
		fullName: z
			.string({ required_error: 'Full name is required' })
			.min(1, 'At least 1 character')
			.max(128, 'Full name is too long (Max 128 characters)')
			.trim(),
		email: z
			.string({ required_error: 'Email is required' })
			.min(3, 'At least 3 characters')
			.max(128, 'Email is too long (Max 128 characters)')
			.email('Invalid email'),
		password: z
			.string({ required_error: 'Password is required' })
			.min(6, 'Password must to be at least 6 chacracters long')
			.max(255, 'Password is too long (Max 255 characters)')
			.trim(),
		confirmPassword: z.string({ required_error: 'Password confirm is required' }).trim()
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
		.string({ required_error: 'Email is required' })
		.min(3, 'At least 3 characters')
		.max(128, 'Email is too long (Max 128 characters)')
		.email('Invalid email'),
	password: z
		.string({ required_error: 'Password is required' })
		.min(6, 'Password must to be at least 6 chacracters long')
		.max(255, 'Password is too long (Max 255 characters)')
		.trim()
});

import { z } from "zod";

export const insertMessageSchema = z.object({
    senderId: z.string().max(30).trim(),
    body: z.string().max(10000).trim().optional(),
});

export const insertImageSchema = z.object({
    senderId: z.string().min(1).max(30).trim(),
    image: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Image must have more that 0 kb"),
});

export const signUpFormSchema = z
    .object({
        fullName: z
            .string({ required_error: "Full name is required" })
            .min(2, "At least 1 character")
            .max(128, "Full name is too long (Max 128 characters)")
            .trim(),
        email: z
            .string({ required_error: "Email is required" })
            .min(3, "At least 3 characters")
            .max(128, "Email is too long (Max 128 characters)")
            .email("Invalid email"),
        password: z
            .string({ required_error: "Password is required" })
            .min(6, "Password must to be at least 6 chacracters long")
            .max(255, "Password is too long (Max 255 characters)")
            .trim(),
        confirmPassword: z
            .string({ required_error: "Password confirm is required" })
            .trim(),
    })
    .superRefine((val, ctx) => {
        if (val.password !== val.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password and password confirm do not match",
                path: ["confirmPassword"],
            });
        }
    });

export const signInFormSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .min(3, "At least 3 characters")
        .max(128, "Email is too long (Max 128 characters)")
        .email("Invalid email"),
    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must to be at least 6 chacracters long")
        .max(255, "Password is too long (Max 255 characters)")
        .trim(),
});

export const editUserSchema = z.object({
    fullName: z
        .string({ required_error: "Full name is required" })
        .min(2, "At least 1 character")
        .max(128, "Full name is too long (Max 128 characters)"),
    profileImage: z
        .instanceof(File, { message: "Image is required" })
        .refine((file) => file.size > 0, "Image should have more than 0 kb")
        .optional(),
});

export const apiEditUserSchema = z.object({
    fullName: z
        .string({ required_error: "Full name is required" })
        .min(2, "At least 1 character")
        .max(128, "Full name is too long (Max 128 characters)"),
    profileImage: z
        .instanceof(File, { message: "Image is required" })
        .refine((file) => file.size > 0, "Image should have more than 0 kb")
        .or(z.string())
        .optional(),
});

export const createGroupSchema = z.object({
    groupName: z
        .string()
        .min(1, "Group name is required")
        .max(255, "Max lenght is 255 characters")
        .trim(),
    creatorId: z.string().min(1).max(20).trim(),
    userIds: z
        .array(z.string().min(1).max(20).trim())
        .min(1, "Please select at least one member"),
});

export const editTextMessage = z.object({
    senderId: z.string().min(1).max(20).trim(),
    newBody: z.string().min(1).max(10000).trim(),
});

export const editImageMessage = z.object({
    senderId: z.string().min(1).max(20).trim(),
    newImage: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Image must have more that 0 kb"),
});

export const editMemberNick = z.object({
    changedById: z.string().min(1).max(20).trim(),
    conversationId: z.string().min(1).max(20).trim(),
    newNick: z.string().min(1).max(128).trim(),
});

export const editConversationName = z.object({
    changedById: z.string().min(1).max(20).trim(),
    newName: z.string().min(1).max(255).trim(),
});

export const editConversationImage = z.object({
    changedById: z.string().min(1).max(20).trim(),
    newImage: z
        .instanceof(File, { message: "Image is required" })
        .refine((file) => file.size > 0, "Image should have more than 0 kb"),
});

export const addMemberToConversation = z.object({
    addedById: z.string().min(1).max(20).trim(),
    newUserIds: z.array(z.string().min(1).max(20).trim()).min(1),
});

export const leaveConversation = z.object({
    memberId: z.string().min(1).max(20).trim(),
});

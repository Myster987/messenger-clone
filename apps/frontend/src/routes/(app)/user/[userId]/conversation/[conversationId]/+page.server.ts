import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addMembersToGroup, imageInputSchema, messageInputSchema } from '@/auth/form_schemas';
import { createFormDataFromObject } from '@/utils';
import type {
	DefaultApiResponse,
	ApiResponse,
	MessageWithMember,
	StoreConversation
} from '@/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params: { conversationId },
	locals: { apiClient }
}) => {
	const fetchConversationData = async () => {
		const res = await apiClient.get(`api/conversations/by_id/${conversationId}`);
		const { data } = await res.json<ApiResponse<{ data: StoreConversation['conversation'] }>>();

		return data;
	};

	const fetchMessages = async (page = '0') => {
		const res = await apiClient.get(
			`api/socket/messages/${conversationId}?` +
				new URLSearchParams({
					page
				}).toString()
		);

		const { data, nextPage } =
			await res.json<ApiResponse<{ data: MessageWithMember[]; nextPage: number | null }>>();
		return { messages: data || [], nextPage };
	};

	return {
		conversationData: await fetchConversationData(),
		addMembersToGroupFormObject: await superValidate(zod(addMembersToGroup)),
		messageFormObject: await superValidate(zod(messageInputSchema)),
		imageFormObject: await superValidate(zod(imageInputSchema)),
		messagesData: await fetchMessages()
	};
};

export const actions: Actions = {
	sendMessage: async ({ request, params: { conversationId }, locals: { apiClient } }) => {
		const form = await superValidate(request, zod(messageInputSchema));

		if (!form.valid) {
			return message(form, { text: 'Invalid message content.', success: false });
		}

		const formData = form.data;

		const body = createFormDataFromObject({
			senderId: formData.senderId,
			body: formData.text
		});

		const res = await apiClient.post(`api/socket/messages/text/${conversationId}`, {
			body
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return message(form, { text: 'Something went wrong.', success: false }, { status: 500 });
		}

		return { form, success: true };
	},
	sendImage: async ({ request, params: { conversationId }, locals: { apiClient } }) => {
		const form = await superValidate(request, zod(imageInputSchema));

		if (!form.valid) {
			return message(withFiles(form), { text: 'Invalid message content.', success: false });
		}

		const formData = form.data;

		const body = createFormDataFromObject(formData);

		const res = await apiClient.post(`api/socket/messages/image/${conversationId}`, {
			body
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return message(
				withFiles(form),
				{ text: 'Something went wrong.', success: false },
				{ status: 500 }
			);
		}

		return withFiles({ form, success: true });
	},
	deleteMessage: async ({ request, locals: { apiClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			messageId: string;
			senderId: string;
		};

		const res = await apiClient.delete(`api/socket/messages/${formData.messageId}`, {
			json: {
				senderId: formData.senderId
			}
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	},
	editTextMessage: async ({ request, locals: { apiClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			messageId: string;
			senderId: string;
			newBody: string;
		};

		const res = await apiClient.patch(`api/socket/messages/text/${formData.messageId}`, {
			json: {
				senderId: formData.senderId,
				newBody: formData.newBody
			}
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	},
	editImageMessage: async ({ request, locals: { apiClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			messageId: string;
			senderId: string;
			newImage: File;
		};

		if (formData.newImage.size == 0) {
			return fail(400, { success: false });
		}

		const body = createFormDataFromObject({
			senderId: formData.senderId,
			newImage: formData.newImage
		});

		const res = await apiClient.patch(`api/socket/messages/image/${formData.messageId}`, {
			body
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	},
	editNick: async ({ request, params: { conversationId }, locals: { apiClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			memberId: string;
			newNick: string;
			changedById: string;
		};

		const res = await apiClient.patch(`api/socket/members/nick/${formData.memberId}`, {
			json: {
				conversationId,
				newNick: formData.newNick,
				changedById: formData.changedById
			}
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	},
	editConversationName: async ({ request, params: { conversationId }, locals: { apiClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			newName: string;
			changedById: string;
		};

		const res = await apiClient.patch(`api/conversations/group/name/${conversationId}`, {
			json: formData
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	},
	editConversationImage: async ({ request, params: { conversationId }, locals: { apiClient } }) => {
		const formData = await request.formData();

		const res = await apiClient.patch(`api/conversations/group/image/${conversationId}`, {
			body: formData
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	},
	addNewMembersToGroup: async ({ request, params: { conversationId }, locals: { apiClient } }) => {
		const form = await superValidate(request, zod(addMembersToGroup));

		if (!form.valid) {
			return message(form, { text: 'Invalid data.', success: false });
		}
		const formData = form.data;

		const res = await apiClient.put(`api/conversations/members/${conversationId}`, {
			json: formData
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return message(form, { text: 'Something went wrong', success }, { status: 400 });
		}

		return message(form, { text: 'New member(s) successfully added.', success });
	},
	leaveGroup: async ({ request, params: { conversationId, userId }, locals: { apiClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			memberId: string;
		};

		const res = await apiClient.delete(`api/conversations/leave/${conversationId}`, {
			json: formData
		});

		const { success } = await res.json<DefaultApiResponse>();

		if (!success) {
			return fail(res.status, { success });
		}
		redirect(302, `/user/${userId}`);
	}
};

import { fail } from '@sveltejs/kit';
import { message, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { imageInputSchema, messageInputSchema } from '@/auth/form_schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params: { conversationId },
	locals: { honoClient }
}) => {
	const fetchConversationData = async () => {
		const res = await honoClient.api.conversations.by_id[':conversationId'].$get({
			param: {
				conversationId
			}
		});

		const { data } = await res.json();
		return data;
	};

	const fetchMessages = async (page = '0') => {
		const res = await honoClient.api.socket.messages[':conversationId'].$get({
			param: { conversationId: conversationId },
			query: { page }
		});
		const { data, nextPage } = await res.json();
		return { messages: data || [], nextPage };
	};

	return {
		conversationData: await fetchConversationData(),
		messageFormObject: await superValidate(zod(messageInputSchema)),
		imageFormObject: await superValidate(zod(imageInputSchema)),
		messagesData: await fetchMessages()
	};
};

export const actions: Actions = {
	sendMessage: async ({ request, params: { conversationId }, locals: { honoClient } }) => {
		const form = await superValidate(request, zod(messageInputSchema));

		if (!form.valid) {
			return message(form, { text: 'Invalid message content.', success: false });
		}

		const formData = form.data;

		const res = await honoClient.api.socket.messages.text[':conversationId'].$post({
			param: { conversationId },
			form: {
				senderId: formData.senderId,
				body: formData.text
			}
		});

		const { success } = await res.json();

		if (!success) {
			return message(form, { text: 'Something went wrong.', success: false }, { status: 500 });
		}

		return { form, success: true };
	},
	sendImage: async ({ request, params: { conversationId }, locals: { honoClient } }) => {
		const form = await superValidate(request, zod(imageInputSchema));

		if (!form.valid) {
			return message(withFiles(form), { text: 'Invalid message content.', success: false });
		}

		const formData = form.data;

		const res = await honoClient.api.socket.messages.image[':conversationId'].$post({
			param: {
				conversationId
			},
			form: formData
		});

		const { success } = await res.json();

		if (!success) {
			return message(
				withFiles(form),
				{ text: 'Something went wrong.', success: false },
				{ status: 500 }
			);
		}

		return withFiles({ form, success: true });
	},
	deleteMessage: async ({ request, params: { conversationId }, locals: { honoClient } }) => {
		const formData = Object.fromEntries(await request.formData()) as unknown as {
			messageId: string;
			senderId: string;
		};

		const res = await honoClient.api.socket.messages[':messageId'].$delete({
			param: {
				messageId: formData.messageId
			},
			json: {
				senderId: formData.senderId
			}
		});

		const { success } = await res.json();

		if (!success) {
			return fail(res.status, { success });
		}

		return {
			success
		};
	}
};

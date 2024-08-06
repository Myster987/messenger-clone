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

	return {
		conversationData: await fetchConversationData(),
		messageFormObject: await superValidate(zod(messageInputSchema)),
		imageFormObject: await superValidate(zod(imageInputSchema))
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
	}
};

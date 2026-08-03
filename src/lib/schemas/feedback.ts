import { z } from 'zod/v3';

// Ported from the Next app's src/components/forms/feedback-form.tsx.
export const feedbackFormSchema = z.object({
	name: z.string().min(2).max(50),
	email: z.string().email(),
	feedback: z.string().min(2).max(500)
});

export type FeedbackForm = z.infer<typeof feedbackFormSchema>;

import { z } from 'zod/v3';

// Ported from the Next app's src/components/forms/submission-form.tsx.
export const submissionFormSchema = z.object({
	name: z.string().min(2).max(50),
	link: z.string().url()
});

export type SubmissionForm = z.infer<typeof submissionFormSchema>;

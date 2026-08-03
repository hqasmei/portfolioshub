import { z } from 'zod/v3';

// Ported from the Next app's admin add/edit-portfolio forms. Tags, titles and
// socials are comma-separated strings in the form and split on submit.
export const portfolioFormSchema = z.object({
	name: z.string().min(2).max(50),
	link: z.string().url(),
	tags: z.string(),
	titles: z.string(),
	socials: z.string(),
	image: z.string()
});

export type PortfolioForm = z.infer<typeof portfolioFormSchema>;

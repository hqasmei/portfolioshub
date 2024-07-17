import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const addEmail = mutation({
  args: {
    email: v.string(),
    subscriptionDate: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('newsletters', {
      email: args.email,
      subscriptionDate: args.subscriptionDate,
      isActive: args.isActive,
    });
  },
});

export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existingEmail = await ctx.db
      .query('newsletters')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    return !!existingEmail;
  },
});

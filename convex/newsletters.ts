import { ConvexError, v } from 'convex/values';

import { mutation } from './_generated/server';

export const addEmail = mutation({
  args: {
    email: v.string(),
    subscriptionDate: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // TODO: check if email already exists, if so, return error, else insert

    const existingEmail = await ctx.db
      .query('newsletters')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (existingEmail) {
      throw new ConvexError('Email already exists');
    }

    return await ctx.db.insert('newsletters', {
      email: args.email,
      subscriptionDate: args.subscriptionDate,
      isActive: args.isActive,
    });
  },
});

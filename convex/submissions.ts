import { v } from 'convex/values';

import { mutation } from './_generated/server';

export const createSubmission = mutation({
  args: {
    name: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('submissions', {
      name: args.name,
      link: args.link,
    });
  },
});

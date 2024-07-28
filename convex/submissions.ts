import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { throwWithoutAdmin } from './util';

export const getSubmissions = query({
  handler: async (ctx) => {
    return await ctx.db.query('submissions').collect();
  },
});

export const createSubmission = mutation({
  args: {
    name: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('submissions', {
      name: args.name,
      link: args.link,
      status: 'pending',
    });
  },
});

export const updateSubmission = mutation({
  args: {
    submissionId: v.id('submissions'),
    name: v.string(),
    link: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await throwWithoutAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new ConvexError('Submission not found');
    }

    await ctx.db.patch(args.submissionId, {
      name: args.name,
      link: args.link,
      status: args.status,
    });
  },
});

export const deleteSubmission = mutation({
  args: {
    submissionId: v.id('submissions'),
  },

  handler: async (ctx, args) => {
    await throwWithoutAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new ConvexError('Submission not found');
    }
    await ctx.db.delete(submission._id);
  },
});

import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { throwWithoutAdmin } from './util';

export const getAllTemplates = query({
  handler: async (ctx) => {
    return await ctx.db.query('templates').collect();
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    createdBy: v.string(),
    image: v.id('_storage'),
    technology: v.optional(v.array(v.string())),
    link: v.string(),
    tags: v.optional(v.array(v.string())),
    isPaid: v.boolean(),
  },
  handler: async (ctx, args) => {
    await throwWithoutAdmin(ctx);

    await ctx.db.insert('templates', {
      name: args.name,
      description: args.description,
      createdBy: args.createdBy,
      image: args.image,
      technology: args.technology,
      link: args.link,
      tags: args.tags,
      isPaid: args.isPaid,
    });
  },
});

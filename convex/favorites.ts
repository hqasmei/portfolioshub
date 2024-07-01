import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getUserId } from './util';

export const getFavoritesForUser = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    return await ctx.db
      .query('favorites')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();
  },
});

export const addFavorite = mutation({
  args: { portfolioId: v.id('portfolios') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    await ctx.db.insert('favorites', {
      userId: userId,
      portfolioId: args.portfolioId,
    });
  },
});

export const removeFavorite = mutation({
  args: { favoriteId: v.id('favorites') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    await ctx.db.delete(args.favoriteId);
  },
});

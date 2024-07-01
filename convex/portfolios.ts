import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const getPortfolios = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query('portfolios').paginate(args.paginationOpts);
  },
});

export const createPortfolio = mutation({
  args: {
    name: v.string(),
    link: v.string(),
    tags: v.optional(v.array(v.string())),
    image: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('portfolios', {
      name: args.name,
      link: args.link,
      tags: args.tags,
      image: args.image,
    });
  },
});

export const incrementPortfolioFavoriteCount = mutation({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);

    if (!portfolio) {
      throw new ConvexError('Portfolio not found');
    }

    let favoritesCount;

    if (portfolio.favoritesCount === undefined) {
      favoritesCount = 1;
    } else {
      favoritesCount = portfolio.favoritesCount + 1;
    }

    await ctx.db.patch(args.portfolioId, {
      favoritesCount: favoritesCount,
    });
  },
});

export const decrementPortfolioFavoriteCount = mutation({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);

    if (!portfolio) {
      throw new ConvexError('Portfolio not found');
    }

    let favoritesCount;

    if (
      portfolio.favoritesCount === 0 ||
      portfolio.favoritesCount === undefined
    ) {
      favoritesCount = 0;
    } else {
      favoritesCount = portfolio.favoritesCount - 1;
    }

    await ctx.db.patch(args.portfolioId, {
      favoritesCount: favoritesCount,
    });
  },
});

export const getPortfolioFromId = query({
  args: {
    portfolioId: v.id('portfolios'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('portfolios')
      .withIndex('by_id', (q) => q.eq('_id', args.portfolioId))
      .first();
  },
});

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';



export const getPortfolios = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('portfolios').collect();
  },
});


interface Rating {
  ipAddress: string;
  rating: string;
}


export const giveRating = mutation({
  args: {
    portfolioId: v.id('portfolios'),
    newRating: v.string(),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const { portfolioId, newRating, ipAddress } = args;
    const portfolio: any = await ctx.db.get(portfolioId);

    if (!portfolio.ratings) {
      portfolio.ratings = [];
    }

    
    const existingRatingIndex = portfolio.ratings.findIndex((r: Rating) => r.ipAddress === ipAddress);
    if (existingRatingIndex !== -1) {
      throw new Error('This IP address has already given a rating.');
    } else {
      portfolio.ratings.push({ ipAddress, rating: newRating });
    }

    await ctx.db.patch(portfolioId, { ratings: portfolio.ratings });
  },
});

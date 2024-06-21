import { query } from './_generated/server';

export const getPortfolios = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('portfolios').collect();
  },
});

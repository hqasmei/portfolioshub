import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getPortfolios = query({
  handler: async (ctx) => {
    return await ctx.db.query("portfolios").collect();
  },
});

export const createPortfolio = mutation({
  args: {
    name: v.string(),
    link: v.string(),
    tags: v.optional(v.array(v.string())),
    image: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("portfolios", {
      name: args.name,
      link: args.link,
      tags: args.tags,
      image: args.image,
    });
  },
});

export const getPortfolioFromId = query({
  args: {
    portfolioId: v.id("portfolios"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolios")
      .withIndex("by_id", (q) => q.eq("_id", args.portfolioId))
      .first();
  },
});

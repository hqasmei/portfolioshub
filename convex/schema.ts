import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  portfolios: defineTable({
    name: v.string(),
    link: v.string(),
    tags: v.optional(v.array(v.string())),
    image: v.id('_storage'),
    favoritesCount: v.optional(v.number()),
  }),
  submissions: defineTable({
    name: v.string(),
    link: v.string(),
    status: v.optional(v.string()),
  }),
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  })
    .index('by_userId', ['userId'])
    .index('by_email', ['email']),
  favorites: defineTable({
    userId: v.string(),
    portfolioId: v.id('portfolios'),
  })
    .index('by_userId', ['userId'])
    .index('by_portfolioId', ['portfolioId']),
});

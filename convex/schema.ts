import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * What the AI review pipeline (convex/review.ts) learned about a submission.
 *
 * Everything here is advisory. `verdict` is a recommendation the admin sees on
 * the /admin page; nothing in the system acts on it automatically. Fields are
 * optional because a run can fail part-way (`state: 'failed'`) and still has to
 * record what it managed to get.
 */
export const reviewValidator = v.object({
  state: v.union(v.literal('ok'), v.literal('failed')),
  verdict: v.optional(
    v.union(v.literal('approve'), v.literal('review'), v.literal('reject')),
  ),
  confidence: v.optional(v.number()),
  reason: v.optional(v.string()),
  checks: v.optional(
    v.object({
      loads: v.boolean(),
      isPersonalPortfolio: v.boolean(),
      hasOwnWork: v.boolean(),
      isPlaceholder: v.boolean(),
      isTemplateDemo: v.boolean(),
      nsfw: v.boolean(),
    }),
  ),
  suggestedName: v.optional(v.string()),
  titles: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
  socials: v.optional(v.array(v.string())),
  tech: v.optional(v.array(v.string())),
  description: v.optional(v.string()),
  httpStatus: v.optional(v.number()),
  finalUrl: v.optional(v.string()),
  duplicateOf: v.optional(v.id('portfolios')),
  runId: v.optional(v.string()),
  error: v.optional(v.string()),
  reviewedAt: v.number(),
});

export default defineSchema({
  portfolios: defineTable({
    name: v.string(),
    link: v.string(),
    titles: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    socials: v.optional(v.array(v.string())),
    image: v.id('_storage'),
    favoritesCount: v.optional(v.number()),
  })
    .index('by_favoritesCount', ['favoritesCount'])
    .index('by_name', ['name'])
    .index('by_tags', ['tags']),
  submissions: defineTable({
    name: v.string(),
    link: v.string(),
    // pending -> reviewing -> needs_review -> completed | rejected.
    // Older rows predate the AI pipeline and carry only pending/completed.
    status: v.optional(v.string()),
    // Canonical form of `link` (see normalizeLink in ./util), used to spot a
    // resubmission of something already listed.
    normalizedLink: v.optional(v.string()),
    // Captured by the review pipeline, reused as the portfolio image on
    // approval so the admin never has to screenshot the site by hand.
    screenshotId: v.optional(v.id('_storage')),
    review: v.optional(reviewValidator),
  })
    .index('by_status', ['status'])
    .index('by_normalizedLink', ['normalizedLink']),
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
  templates: defineTable({
    name: v.string(),
    description: v.string(),
    createdBy: v.string(),
    image: v.id('_storage'),
    technology: v.optional(v.array(v.string())),
    link: v.string(),
    tags: v.optional(v.array(v.string())),
    isPaid: v.boolean(),
  })
    .index('by_name', ['name'])
    .index('by_isPaid', ['isPaid']),
  newsletters: defineTable({
    email: v.string(),
    subscriptionDate: v.string(),
    isActive: v.boolean(),
  }).index('by_email', ['email']),
});

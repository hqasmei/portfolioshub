import { ConvexError, v } from 'convex/values';

import { internal } from './_generated/api';
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { normalizeLink } from './reviewLogic';
import { reviewValidator } from './schema';
import { throwWithoutAdmin } from './util';

export const getSubmissions = query({
  handler: async (ctx) => {
    // Admin-only: the /admin page hides itself from non-admins in the UI, but
    // without this guard any signed-in client could read every submission by
    // calling the query directly.
    await throwWithoutAdmin(ctx);

    return await ctx.db.query('submissions').collect();
  },
});

export const createSubmission = mutation({
  args: {
    name: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert('submissions', {
      name: args.name,
      link: args.link,
      normalizedLink: normalizeLink(args.link),
      status: 'pending',
    });

    // Scheduling from inside the mutation is transactional: if the insert
    // commits, the review is queued, and if it rolls back neither happened.
    await ctx.scheduler.runAfter(0, internal.review.reviewSubmission, {
      submissionId,
    });
  },
});

/** Read-back for the review pipeline, which runs as the system and has no user. */
export const getSubmissionInternal = internalQuery({
  args: { submissionId: v.id('submissions') },
  handler: async (ctx, args) => await ctx.db.get(args.submissionId),
});

export const markReviewing = internalMutation({
  args: { submissionId: v.id('submissions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, { status: 'reviewing' });
  },
});

/**
 * Stored as soon as the capture succeeds, before the model has answered, so a
 * screenshot is never lost to a later failure in the run.
 */
export const saveScreenshot = internalMutation({
  args: {
    submissionId: v.id('submissions'),
    screenshotId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, { screenshotId: args.screenshotId });
  },
});

/**
 * Land the review and put the row in front of the admin. Even a failed run ends
 * up in `needs_review` — the recommendation is optional, the human step is not.
 */
export const saveReview = internalMutation({
  args: {
    submissionId: v.id('submissions'),
    review: reviewValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      review: args.review,
      status: 'needs_review',
    });
  },
});

/**
 * Run the review again for one submission.
 *
 * Reviews are skipped when a row already has one, so a transient failure (a
 * renderer timeout, a missing key) would otherwise be permanent. Clearing the
 * review is what re-arms it.
 */
export const retryReview = mutation({
  args: { submissionId: v.id('submissions') },
  handler: async (ctx, args) => {
    await throwWithoutAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new ConvexError('Submission not found');
    }

    await ctx.db.patch(args.submissionId, {
      review: undefined,
      normalizedLink: normalizeLink(submission.link),
      status: 'pending',
    });

    await ctx.scheduler.runAfter(0, internal.review.reviewSubmission, {
      submissionId: args.submissionId,
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

/**
 * Rejection is a status, not a delete: it keeps the URL on file so a
 * resubmission of the same site is caught as a duplicate instead of paying for
 * another render and another model run, and it leaves a record of what was
 * turned down. `deleteSubmission` still exists for genuinely removing a row.
 */
export const rejectSubmission = mutation({
  args: { submissionId: v.id('submissions') },
  handler: async (ctx, args) => {
    await throwWithoutAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new ConvexError('Submission not found');
    }

    await ctx.db.patch(args.submissionId, { status: 'rejected' });
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

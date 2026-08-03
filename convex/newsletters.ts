import { ConvexError, v } from 'convex/values';

import { api, internal } from './_generated/api';
import { action, internalMutation } from './_generated/server';

export const addEmail = internalMutation({
  args: {
    email: v.string(),
    subscriptionDate: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // TODO: check if email already exists, if so, return error, else insert
    const existingEmail = await ctx.db
      .query('newsletters')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (existingEmail) {
      throw new ConvexError('Email already exists');
    }

    return await ctx.db.insert('newsletters', {
      email: args.email,
      subscriptionDate: args.subscriptionDate,
      isActive: args.isActive,
    });
  },
});

export const verifyEmail = action({
  args: {
    email: v.string(),
    subscriptionDate: v.string(),
    isActive: v.boolean(),
    recaptchaToken: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.runQuery(api.users.isAdmin);
    if (!admin) {
      throw new ConvexError('You must be an admin to create a portfolio');
    }
    // implementation goes here
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${args.recaptchaToken}`,
      },
    );
    const json = (await response.json()) as { success: boolean };

    if (!json.success) {
      throw new Error('invalid recaptcha token');
    }

    // Add email to newsletters table
    await ctx.runMutation(internal.newsletters.addEmail, {
      email: args.email,
      subscriptionDate: args.subscriptionDate,
      isActive: args.isActive,
    });
  },
});

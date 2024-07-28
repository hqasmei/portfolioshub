import { ConvexError, v } from 'convex/values';

import { Id } from './_generated/dataModel';
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from './_generated/server';
import { getUserId } from './util';

export const updateUser = internalMutation({
  args: {
    userId: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    let user = await getUserByUserId(ctx, args.userId);

    if (!user) {
      throw new ConvexError('user with id not found');
    }

    await ctx.db.patch(user._id, {
      profileImage: args.profileImage,
    });
  },
});

export const createUser = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!user) {
      await ctx.db.insert('users', {
        userId: args.userId,
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
      });
    }
  },
});

export const getMyUser = query({
  async handler(ctx) {
    const userId = await getUserId(ctx);

    if (!userId) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!user) {
      return null;
    }

    return user;
  },
});

export const updateMyUser = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    const userId = await getUserId(ctx);

    if (!userId) {
      throw new ConvexError('You must be logged in.');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!user) {
      throw new ConvexError('user not found');
    }

    await ctx.db.patch(user._id, {
      name: args.name,
    });
  },
});

export const deleteUser = internalMutation({
  args: { userId: v.string() },
  async handler(ctx, args) {
    const user = await getUserByUserId(ctx, args.userId);

    if (!user) {
      throw new ConvexError('could not find user');
    }

    await ctx.db.delete(user._id);
  },
});

export const getUserByUserId = (
  ctx: MutationCtx | QueryCtx,
  userId: string,
) => {
  return ctx.db
    .query('users')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first();
};

export const isAdmin = query({
  async handler(ctx) {
    const userId = await getUserId(ctx);
    const user = await getUserByUserId(ctx, userId as Id<'users'>);

    if (!user) {
      return false;
    }

    return user.isAdmin === true;
  },
});

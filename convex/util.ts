import type { GenericId, Validator } from 'convex/values';
import { ConvexError, v } from 'convex/values';

import type { TableNames } from './_generated/dataModel';
import type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server';
import { isUserAdmin } from './users';

export function vid<TableName extends TableNames>(
  tableName: TableName,
): Validator<GenericId<TableName>> {
  return v.id(tableName);
}

export function filterNullishValues<T>(
  arr: (T | null | undefined)[],
): NonNullable<T>[] {
  return arr.filter(
    (value): value is NonNullable<T> => value !== null && value !== undefined,
  );
}

export async function getUserId(ctx: QueryCtx | ActionCtx | MutationCtx) {
  return (await ctx.auth.getUserIdentity())?.subject;
}

export function formatName(firstName?: string, lastName?: string) {
  firstName = firstName ?? '';
  lastName = lastName ?? '';
  let combinedName = `${firstName} ${lastName}`.trim();
  if (combinedName === '') {
    combinedName = 'Anonymous';
  }
  return combinedName;
}

export async function throwWithoutAdmin(ctx: MutationCtx) {
  const admin = await isUserAdmin(ctx);
  if (!admin) {
    throw new ConvexError('You must be an admin to create a portfolio');
  }
}

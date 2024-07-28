import { ConvexError, GenericId, v, Validator } from 'convex/values';

import { TableNames } from './_generated/dataModel';
import { ActionCtx, MutationCtx, QueryCtx } from './_generated/server';
import { isAdmin } from './users';

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
  const admin = await isAdmin(ctx, {});
  if (!admin) {
    throw new ConvexError('You must be an admin to create a portfolio');
  }
}
